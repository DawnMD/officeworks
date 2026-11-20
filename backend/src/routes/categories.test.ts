import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import {
  type CatalogueSource,
  CatalogueUnavailableError,
  type Category,
  type Product,
} from "../catalogue/catalogue-source.js";
import { createInMemoryCatalogue } from "../catalogue/in-memory.js";

const electronics: Category = { slug: "electronics", name: "electronics" };
const mensClothing: Category = {
  slug: "mens-clothing",
  name: "men's clothing",
};

const product = (id: number, category: Category = electronics): Product => ({
  id,
  name: `Product ${id}`,
  description: `Description ${id}`,
  price: id * 10,
  imageUrl: `https://images.example/${id}.jpg`,
  category,
  rating: { rate: 4, count: 10 },
});

const appWith = (
  catalogue: CatalogueSource,
  categories: Record<string, number[]> = {},
) =>
  createApp({
    corsOrigins: ["http://localhost:3000"],
    catalogue,
    featured: { home: [], categories },
  });

const down = (): CatalogueSource => {
  const fail = () =>
    Promise.reject(new CatalogueUnavailableError("provider down"));
  return {
    listProducts: fail,
    getProduct: fail,
    listCategories: fail,
    listProductsInCategory: fail,
  };
};

const documentedResponses = async (path: string) => {
  const res = await appWith(createInMemoryCatalogue()).request("/openapi.json");
  const spec = (await res.json()) as {
    paths: Record<string, { get?: { responses: Record<string, unknown> } }>;
  };
  return Object.keys(spec.paths[path]?.get?.responses ?? {}).sort();
};

describe("GET /categories", () => {
  it("returns every category with its slug and name", async () => {
    const catalogue = createInMemoryCatalogue([], [electronics, mensClothing]);

    const res = await appWith(catalogue).request("/categories");

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([
      { slug: "electronics", name: "electronics" },
      { slug: "mens-clothing", name: "men's clothing" },
    ]);
  });

  it("returns 502 catalogue_unavailable when the provider fails", async () => {
    const res = await appWith(down()).request("/categories");

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "catalogue_unavailable" });
  });

  it("is documented in the OpenAPI spec with its error responses", async () => {
    expect(await documentedResponses("/categories")).toEqual(["200", "502"]);
  });
});

describe("GET /categories/{slug}", () => {
  it("returns the category's featured products in configured order and the rest, in provider order, as additional", async () => {
    const catalogue = createInMemoryCatalogue([
      product(1),
      product(2),
      product(3),
      product(4),
      product(5, mensClothing),
    ]);

    const res = await appWith(catalogue, { electronics: [3, 1] }).request(
      "/categories/electronics",
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      category: { slug: "electronics", name: "electronics" },
      featured: [product(3), product(1)],
      additional: [product(2), product(4)],
    });
  });

  it("returns no featured products for a category with no configured picks", async () => {
    const catalogue = createInMemoryCatalogue([
      product(1),
      product(2, mensClothing),
    ]);

    const res = await appWith(catalogue, { electronics: [1] }).request(
      "/categories/mens-clothing",
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      category: { slug: "mens-clothing", name: "men's clothing" },
      featured: [],
      additional: [product(2, mensClothing)],
    });
  });

  it("returns 404 not_found for an unknown slug", async () => {
    const catalogue = createInMemoryCatalogue([product(1)]);

    const res = await appWith(catalogue).request("/categories/garden");

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
  });

  it("returns 502 catalogue_unavailable when the provider fails", async () => {
    const res = await appWith(down()).request("/categories/electronics");

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "catalogue_unavailable" });
  });

  it("is documented in the OpenAPI spec with its error responses", async () => {
    expect(await documentedResponses("/categories/{slug}")).toEqual([
      "200",
      "404",
      "502",
    ]);
  });
});
