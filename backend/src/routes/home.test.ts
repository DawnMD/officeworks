import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import {
  type CatalogueSource,
  CatalogueUnavailableError,
  type Product,
} from "../catalogue/catalogue-source.js";
import { createInMemoryCatalogue } from "../catalogue/in-memory.js";

const product = (id: number): Product => ({
  id,
  name: `Product ${id}`,
  description: `Description ${id}`,
  price: id * 10,
  imageUrl: `https://images.example/${id}.jpg`,
  category: { slug: "electronics", name: "electronics" },
  rating: { rate: 4, count: 10 },
});

const appWith = (catalogue: CatalogueSource, home: number[]) =>
  createApp({
    corsOrigins: ["http://localhost:3000"],
    catalogue,
    featured: { home, categories: {} },
  });

describe("GET /home", () => {
  it("returns the featured products in the configured order", async () => {
    const catalogue = createInMemoryCatalogue([
      product(1),
      product(2),
      product(3),
    ]);

    const res = await appWith(catalogue, [3, 1, 2]).request("/home");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      featured: [product(3), product(1), product(2)],
    });
  });

  it("skips a configured id that is not in the catalogue", async () => {
    const catalogue = createInMemoryCatalogue([product(1), product(2)]);

    const res = await appWith(catalogue, [2, 99, 1]).request("/home");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ featured: [product(2), product(1)] });
  });

  it("returns 502 catalogue_unavailable when the provider fails", async () => {
    const down: CatalogueSource = {
      ...createInMemoryCatalogue(),
      listProducts: () =>
        Promise.reject(new CatalogueUnavailableError("provider down")),
    };

    const res = await appWith(down, [1]).request("/home");

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "catalogue_unavailable" });
  });

  it("is documented in the OpenAPI spec with its error responses", async () => {
    const res = await appWith(createInMemoryCatalogue(), []).request(
      "/openapi.json",
    );
    const spec = (await res.json()) as {
      paths: Record<string, { get?: { responses: Record<string, unknown> } }>;
    };

    expect(
      Object.keys(spec.paths["/home"]?.get?.responses ?? {}).sort(),
    ).toEqual(["200", "502"]);
  });
});
