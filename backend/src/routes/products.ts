import { createRoute, z } from "@hono/zod-openapi";
import type { CatalogueSource } from "../catalogue/catalogue-source.js";
import {
  CatalogueUnavailableSchema,
  NotFoundSchema,
  ValidationFailedSchema,
} from "../http/errors.js";
import { createRouter } from "../http/router.js";

const CategorySchema = z
  .object({ slug: z.string(), name: z.string() })
  .openapi("Category");

const ProductSchema = z
  .object({
    id: z.number().int(),
    name: z.string(),
    description: z.string(),
    price: z.number(),
    imageUrl: z.string(),
    category: CategorySchema,
    rating: z.object({ rate: z.number(), count: z.number().int() }),
  })
  .openapi("Product");

const getProduct = createRoute({
  method: "get",
  path: "/products/{id}",
  tags: ["catalogue"],
  request: {
    params: z.object({
      id: z.coerce
        .number()
        .int("Must be a whole number")
        .positive("Must be a positive number")
        .openapi({ param: { name: "id", in: "path" }, example: 1 }),
    }),
  },
  responses: {
    200: {
      description: "The product",
      content: { "application/json": { schema: ProductSchema } },
    },
    400: {
      description: "The id is not a positive whole number",
      content: { "application/json": { schema: ValidationFailedSchema } },
    },
    404: {
      description: "No product has this id",
      content: { "application/json": { schema: NotFoundSchema } },
    },
    502: {
      description: "The catalogue provider is unavailable",
      content: { "application/json": { schema: CatalogueUnavailableSchema } },
    },
  },
});

export function products(catalogue: CatalogueSource) {
  return createRouter().openapi(getProduct, async (c) => {
    const { id } = c.req.valid("param");
    return c.json(await catalogue.getProduct(id), 200);
  });
}
