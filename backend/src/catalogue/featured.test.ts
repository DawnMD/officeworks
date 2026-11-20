import { describe, expect, it } from "vitest";
import type { Category, Product } from "./catalogue-source.js";
import { checkFeaturedConfig, resolveFeatured } from "./featured.js";
import { createInMemoryCatalogue } from "./in-memory.js";

const electronics: Category = { slug: "electronics", name: "electronics" };
const jewelery: Category = { slug: "jewelery", name: "jewelery" };

function product(id: number, category: Category): Product {
  return {
    id,
    name: `Product ${id}`,
    description: "",
    price: 10,
    imageUrl: `https://provider.test/img/${id}.jpg`,
    category,
    rating: { rate: 4, count: 10 },
  };
}

const catalogue = createInMemoryCatalogue([
  product(1, jewelery),
  product(2, electronics),
  product(3, electronics),
  product(4, jewelery),
]);

describe("checkFeaturedConfig", () => {
  it("rejects more than five home featured products", () => {
    expect(() =>
      checkFeaturedConfig({ home: [1, 2, 3, 4, 5, 6], categories: {} }),
    ).toThrow("Featured config: home lists 6 products; the limit is 5");
  });

  it("rejects more than three featured products in a category", () => {
    expect(() =>
      checkFeaturedConfig({
        home: [],
        categories: { electronics: [9, 10], jewelery: [5, 6, 7, 8] },
      }),
    ).toThrow(
      'Featured config: category "jewelery" lists 4 products; the limit is 3',
    );
  });
});

describe("resolveFeatured", () => {
  it("returns the products in configured order, not catalogue order", async () => {
    const warnings: string[] = [];
    const featured = await resolveFeatured(catalogue, [3, 1, 4], {
      warn: (message) => warnings.push(message),
    });
    expect(featured.map((p) => p.id)).toEqual([3, 1, 4]);
    expect(warnings).toEqual([]);
  });

  it("skips an id missing from the catalogue and warns about it", async () => {
    const warnings: string[] = [];
    const featured = await resolveFeatured(catalogue, [2, 99, 1], {
      warn: (message) => warnings.push(message),
    });
    expect(featured.map((p) => p.id)).toEqual([2, 1]);
    expect(warnings).toEqual([
      "Featured product 99 is not in the catalogue; skipping it",
    ]);
  });

  it("skips an id from a different category and warns about it", async () => {
    const warnings: string[] = [];
    const featured = await resolveFeatured(catalogue, [3, 1, 2], {
      category: "electronics",
      warn: (message) => warnings.push(message),
    });
    expect(featured.map((p) => p.id)).toEqual([3, 2]);
    expect(warnings).toEqual([
      'Featured product 1 is in category "jewelery", not "electronics"; skipping it',
    ]);
  });
});
