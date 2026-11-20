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

const tee: Product = {
  id: 2,
  name: "Mens Casual Premium Slim Fit T-Shirts",
  description: "Slim-fitting style, contrast raglan long sleeve.",
  price: 22.3,
  imageUrl: "https://images.example/tee.jpg",
  category: { slug: "mens-clothing", name: "men's clothing" },
  rating: { rate: 4.1, count: 259 },
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

describe("GET /products?q=", () => {
  const search = (q: string) =>
    appWith(createInMemoryCatalogue([backpack, tee])).request(
      `/products?q=${encodeURIComponent(q)}`,
    );

  it("returns products whose name contains the term", async () => {
    const res = await search("Backpack");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([backpack]);
  });

  it("returns products whose description contains the term", async () => {
    const res = await search("raglan");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([tee]);
  });

  it("ignores case", async () => {
    const res = await search("bACKPACK");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([backpack]);
  });

  it("trims surrounding whitespace from the term", async () => {
    const res = await search("  pack for  ");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([backpack]);
  });

  it.each([
    ["missing", "/products"],
    ["empty", "/products?q="],
    ["only whitespace", "/products?q=%20%20"],
  ])("returns 400 validation_failed when q is %s", async (_, path) => {
    const res = await appWith(createInMemoryCatalogue([backpack])).request(
      path,
    );

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "validation_failed",
      fields: { q: expect.any(String) },
    });
  });

  it("returns 200 with an empty list when nothing matches", async () => {
    const res = await search("submarine");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("returns 502 catalogue_unavailable when the provider fails", async () => {
    const down: CatalogueSource = {
      ...createInMemoryCatalogue(),
      listProducts: () =>
        Promise.reject(new CatalogueUnavailableError("provider down")),
    };

    const res = await appWith(down).request("/products?q=backpack");

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
      Object.keys(spec.paths["/products"]?.get?.responses ?? {}).sort(),
    ).toEqual(["200", "400", "502"]);
  });
});
