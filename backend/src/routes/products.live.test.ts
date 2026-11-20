import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import { createFakeStoreCatalogue } from "../catalogue/fake-store.js";
import { env } from "../env.js";

// Calls the real Fake Store API at FAKE_STORE_URL. Run locally with `pnpm test:live`; not part of `pnpm test` or CI.
describe("GET /products?q= (live)", () => {
  const app = createApp({
    corsOrigins: ["http://localhost:3000"],
    catalogue: createFakeStoreCatalogue({ fetch, baseUrl: env.fakeStoreUrl }),
    featured: { home: [], categories: {} },
  });

  it("returns only products whose name or description contains the term", async () => {
    const res = await app.request("/products?q=JACKET");

    expect(res.status).toBe(200);
    const products = (await res.json()) as {
      name: string;
      description: string;
    }[];
    expect(products.length).toBeGreaterThan(0);
    for (const { name, description } of products) {
      expect(`${name} ${description}`.toLowerCase()).toContain("jacket");
    }
  });
});
