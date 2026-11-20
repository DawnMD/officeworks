import { createRoute, z } from "@hono/zod-openapi";
import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { CatalogueUnavailableError } from "../catalogue/catalogue-source.js";
import { createInMemoryCatalogue } from "../catalogue/in-memory.js";
import { createRouter } from "./router.js";

/** The app with one throwaway route, built the way every real route is. */
function appWithProbeRoute(handler: () => Promise<unknown> = async () => ({})) {
  const probe = createRouter().openapi(
    createRoute({
      method: "get",
      path: "/probe",
      request: {
        query: z.object({
          q: z.string().min(1, "Enter a search term"),
          limit: z.coerce.number().int("Must be a whole number").optional(),
        }),
      },
      responses: { 200: { description: "ok" } },
    }),
    async (c) => c.json(await handler(), 200),
  );
  const app = createApp({
    corsOrigins: ["http://localhost:3000"],
    catalogue: createInMemoryCatalogue(),
  });
  app.route("/", probe);
  return app;
}

describe("shared error responses", () => {
  it("returns every failing field when validation fails", async () => {
    const res = await appWithProbeRoute().request("/probe?q=&limit=1.5");

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "validation_failed",
      fields: { q: "Enter a search term", limit: "Must be a whole number" },
    });
  });

  it("returns 404 not_found when the catalogue has no such product or category", async () => {
    const app = appWithProbeRoute(() =>
      createInMemoryCatalogue().getProduct(42),
    );

    const res = await app.request("/probe?q=x");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });

  it("returns 502 catalogue_unavailable when the provider fails", async () => {
    const app = appWithProbeRoute(() =>
      Promise.reject(new CatalogueUnavailableError("provider down")),
    );

    const res = await app.request("/probe?q=x");

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "catalogue_unavailable" });
  });

  it("publishes the shared error shapes in the OpenAPI spec", async () => {
    const app = createApp({
      corsOrigins: ["http://localhost:3000"],
      catalogue: createInMemoryCatalogue(),
    });

    const spec = (await (await app.request("/openapi.json")).json()) as {
      components?: { schemas?: Record<string, unknown> };
    };

    expect(spec.components?.schemas).toMatchObject({
      NotFound: {
        type: "object",
        properties: { error: { type: "string", enum: ["not_found"] } },
      },
      CatalogueUnavailable: {
        type: "object",
        properties: {
          error: { type: "string", enum: ["catalogue_unavailable"] },
        },
      },
      ValidationFailed: {
        type: "object",
        properties: {
          error: { type: "string", enum: ["validation_failed"] },
          fields: {
            type: "object",
            additionalProperties: { type: "string" },
          },
        },
      },
    });
  });
});
