import { describe, expect, it } from "vitest";
import { createApp } from "./app.js";
import { createInMemoryCatalogue } from "./catalogue/in-memory.js";

const testApp = () =>
  createApp({
    corsOrigins: ["http://localhost:3000"],
    catalogue: createInMemoryCatalogue(),
    featured: { home: [], categories: {} },
  });

describe("api", () => {
  it("GET /health", async () => {
    const res = await testApp().request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("serves the OpenAPI spec without the placeholder /hello route", async () => {
    const res = await testApp().request("/openapi.json");
    const spec = (await res.json()) as { paths: Record<string, unknown> };
    expect(Object.keys(spec.paths)).toEqual(["/health"]);
  });

  it("allows only the CORS origins it was built with", async () => {
    const app = createApp({
      corsOrigins: ["https://shop.example"],
      catalogue: createInMemoryCatalogue(),
      featured: { home: [], categories: {} },
    });
    const allowed = await app.request("/health", {
      headers: { Origin: "https://shop.example" },
    });
    const denied = await app.request("/health", {
      headers: { Origin: "http://localhost:3000" },
    });
    expect(allowed.headers.get("access-control-allow-origin")).toBe(
      "https://shop.example",
    );
    expect(denied.headers.get("access-control-allow-origin")).toBeNull();
  });

  it("no longer serves GET /hello", async () => {
    const res = await testApp().request("/hello?name=Ada");
    expect(res.status).toBe(404);
  });
});
