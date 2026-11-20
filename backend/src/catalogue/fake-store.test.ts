import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  CatalogueUnavailableError,
  NotFoundError,
} from "./catalogue-source.js";
import { createFakeStoreCatalogue } from "./fake-store.js";

const baseUrl = "https://provider.test";

type Reply = { status?: number; body: unknown };

/** A fetch that answers from a table of provider paths, like Fake Store would. */
function fakeFetch(routes: Record<string, Reply>): typeof fetch {
  return async (input) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.origin !== baseUrl) throw new TypeError(`fetch failed: ${url}`);
    const reply = routes[decodeURIComponent(url.pathname)];
    if (!reply) return new Response("Not Found", { status: 404 });
    const text = reply.body === undefined ? "" : JSON.stringify(reply.body);
    return new Response(text, {
      status: reply.status ?? 200,
      headers: { "content-type": "application/json" },
    });
  };
}

const providerCategories = [
  "electronics",
  "jewelery",
  "men's clothing",
  "women's clothing",
];

const backpack = {
  id: 1,
  title: "Fjallraven Backpack",
  price: 109.95,
  description: "Fits 15 inch laptops",
  category: "men's clothing",
  image: "https://fakestoreapi.com/img/1.jpg",
  rating: { rate: 3.9, count: 120 },
};

const ring = {
  id: 5,
  title: "Dragon Ring",
  price: 695,
  description: "Silver dragon",
  category: "jewelery",
  image: "https://fakestoreapi.com/img/5.jpg",
  rating: { rate: 4.6, count: 400 },
};

describe("Fake Store catalogue", () => {
  it("gets a product by id in our own shape", async () => {
    const catalogue = createFakeStoreCatalogue({
      baseUrl,
      fetch: fakeFetch({ "/products/1": { body: backpack } }),
    });

    expect(await catalogue.getProduct(1)).toEqual({
      id: 1,
      name: "Fjallraven Backpack",
      description: "Fits 15 inch laptops",
      price: 109.95,
      imageUrl: "https://fakestoreapi.com/img/1.jpg",
      category: { slug: "mens-clothing", name: "men's clothing" },
      rating: { rate: 3.9, count: 120 },
    });
  });

  it("lists every product in provider order", async () => {
    const catalogue = createFakeStoreCatalogue({
      baseUrl,
      fetch: fakeFetch({ "/products": { body: [backpack, ring] } }),
    });

    const products = await catalogue.listProducts();

    expect(products.map((p) => [p.id, p.name, p.category.slug])).toEqual([
      [1, "Fjallraven Backpack", "mens-clothing"],
      [5, "Dragon Ring", "jewelery"],
    ]);
  });

  it("lists a category's products by resolving its slug to the provider's name", async () => {
    const catalogue = createFakeStoreCatalogue({
      baseUrl,
      fetch: fakeFetch({
        "/products/categories": { body: providerCategories },
        "/products/category/men's clothing": { body: [backpack] },
      }),
    });

    const products = await catalogue.listProductsInCategory("mens-clothing");

    expect(products.map((p) => p.name)).toEqual(["Fjallraven Backpack"]);
  });

  it("treats an unknown category slug as not found", async () => {
    const catalogue = createFakeStoreCatalogue({
      baseUrl,
      fetch: fakeFetch({
        "/products/categories": { body: providerCategories },
      }),
    });

    await expect(
      catalogue.listProductsInCategory("garden"),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it.each([
    ["an empty body", undefined],
    ["a null body", null],
  ])("treats %s for a product as not found", async (_, body) => {
    const catalogue = createFakeStoreCatalogue({
      baseUrl,
      fetch: fakeFetch({ "/products/999": { body } }),
    });

    await expect(catalogue.getProduct(999)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it.each([404, 500, 503])(
    "reports the catalogue unavailable when the provider answers %i",
    async (status) => {
      const catalogue = createFakeStoreCatalogue({
        baseUrl,
        fetch: fakeFetch({ "/products/categories": { status, body: {} } }),
      });

      await expect(catalogue.listCategories()).rejects.toBeInstanceOf(
        CatalogueUnavailableError,
      );
    },
  );

  describe("when the provider hangs", () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it("gives up after 5 seconds and reports the catalogue unavailable", async () => {
      const hangingFetch: typeof fetch = (_, init) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () =>
            reject(init.signal?.reason),
          );
        });
      const catalogue = createFakeStoreCatalogue({
        baseUrl,
        fetch: hangingFetch,
      });

      let settled = false;
      const result = catalogue.listCategories().finally(() => {
        settled = true;
      });
      const assertion = expect(result).rejects.toBeInstanceOf(
        CatalogueUnavailableError,
      );

      await vi.advanceTimersByTimeAsync(4_999);
      expect(settled).toBe(false);
      await vi.advanceTimersByTimeAsync(1);
      await assertion;
    });
  });

  it("reports the catalogue unavailable when the provider can't be reached", async () => {
    const catalogue = createFakeStoreCatalogue({
      baseUrl,
      fetch: () => Promise.reject(new TypeError("fetch failed")),
    });

    await expect(catalogue.listCategories()).rejects.toBeInstanceOf(
      CatalogueUnavailableError,
    );
  });

  it("lists categories with a slug derived from the provider's name", async () => {
    const catalogue = createFakeStoreCatalogue({
      baseUrl,
      fetch: fakeFetch({
        "/products/categories": { body: providerCategories },
      }),
    });

    expect(await catalogue.listCategories()).toEqual([
      { slug: "electronics", name: "electronics" },
      { slug: "jewelery", name: "jewelery" },
      { slug: "mens-clothing", name: "men's clothing" },
      { slug: "womens-clothing", name: "women's clothing" },
    ]);
  });
});
