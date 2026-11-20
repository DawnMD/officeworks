import { describe, expect, it } from "vitest";
import { env } from "../env.js";
import { createFakeStoreCatalogue } from "./fake-store.js";

// Calls the real Fake Store API at FAKE_STORE_URL. Run locally with `pnpm test:live`; not part of `pnpm test` or CI.
describe("Fake Store catalogue (live)", () => {
  const catalogue = createFakeStoreCatalogue({
    fetch,
    baseUrl: env.fakeStoreUrl,
  });

  it("lists categories", async () => {
    const categories = await catalogue.listCategories();

    expect(categories.length).toBeGreaterThan(0);
    for (const category of categories) {
      expect(category).toEqual({
        slug: expect.stringMatching(/^[a-z0-9-]+$/),
        name: expect.any(String),
      });
    }
  });

  it("gets product 1", async () => {
    const product = await catalogue.getProduct(1);

    expect(product).toEqual({
      id: 1,
      name: expect.any(String),
      description: expect.any(String),
      price: expect.any(Number),
      imageUrl: expect.stringMatching(/^https:\/\//),
      category: {
        slug: expect.stringMatching(/^[a-z0-9-]+$/),
        name: expect.any(String),
      },
      rating: { rate: expect.any(Number), count: expect.any(Number) },
    });
  });
});
