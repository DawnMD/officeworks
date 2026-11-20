import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import {
  type CatalogueSource,
  CatalogueUnavailableError,
  type Product,
} from "../catalogue/catalogue-source.js";
import { createInMemoryCatalogue } from "../catalogue/in-memory.js";

const backpack: Product = {
  id: 1,
  name: "Fjallraven Foldsack No. 1 Backpack",
  description: "Your perfect pack for everyday use.",
  price: 109.95,
  imageUrl: "https://images.example/backpack.jpg",
  category: { slug: "mens-clothing", name: "men's clothing" },
  rating: { rate: 3.9, count: 120 },
};

const appWith = (catalogue: CatalogueSource) =>
  createApp({
    corsOrigins: ["http://localhost:3000"],
    catalogue,
    featured: { home: [], categories: {} },
  });

describe("GET /products/{id}", () => {
  it("returns the product", async () => {
    const res = await appWith(createInMemoryCatalogue([backpack])).request(
      "/products/1",
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id: 1,
      name: "Fjallraven Foldsack No. 1 Backpack",
      description: "Your perfect pack for everyday use.",
      price: 109.95,
      imageUrl: "https://images.example/backpack.jpg",
      category: { slug: "mens-clothing", name: "men's clothing" },
      rating: { rate: 3.9, count: 120 },
    });
  });

  it("returns 404 not_found for an unknown id", async () => {
    const res = await appWith(createInMemoryCatalogue([backpack])).request(
      "/products/999",
    );

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });

  it("returns 400 validation_failed for a non-numeric id", async () => {
    const res = await appWith(createInMemoryCatalogue([backpack])).request(
      "/products/abc",
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "validation_failed",
      fields: { id: expect.any(String) },
    });
  });

  it("returns 502 catalogue_unavailable when the provider fails", async () => {
    const down: CatalogueSource = {
      ...createInMemoryCatalogue(),
      getProduct: () =>
        Promise.reject(new CatalogueUnavailableError("provider down")),
    };

    const res = await appWith(down).request("/products/1");

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "catalogue_unavailable" });
  });

  it("is documented in the OpenAPI spec with its error responses", async () => {
    const res = await appWith(createInMemoryCatalogue()).request(
      "/openapi.json",
    );
    const spec = (await res.json()) as {
      paths: Record<string, { get?: { responses: Record<string, unknown> } }>;
    };

    expect(
      Object.keys(spec.paths["/products/{id}"]?.get?.responses ?? {}).sort(),
    ).toEqual(["200", "400", "404", "502"]);
  });
});
