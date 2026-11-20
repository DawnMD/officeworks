import { createRoute, z } from "@hono/zod-openapi";
import type { CatalogueSource } from "../catalogue/catalogue-source.js";
import { type FeaturedConfig, resolveFeatured } from "../catalogue/featured.js";
import { CatalogueUnavailableSchema } from "../http/errors.js";
import { createRouter } from "../http/router.js";
import { ProductSchema } from "./products.js";

const getHome = createRoute({
  method: "get",
  path: "/home",
  tags: ["catalogue"],
  responses: {
    200: {
      description: "The home page's Featured products, in configured order",
      content: {
        "application/json": {
          schema: z
            .object({ featured: z.array(ProductSchema) })
            .openapi("Home"),
        },
      },
    },
    502: {
      description: "The catalogue provider is unavailable",
      content: { "application/json": { schema: CatalogueUnavailableSchema } },
    },
  },
});

export function home(catalogue: CatalogueSource, featured: FeaturedConfig) {
  return createRouter().openapi(getHome, async (c) => {
    const products = await resolveFeatured(catalogue, featured.home, {
      warn: console.warn,
    });
    return c.json({ featured: products }, 200);
  });
}
