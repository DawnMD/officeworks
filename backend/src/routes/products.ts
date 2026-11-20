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

const searchProducts = createRoute({
  method: "get",
  path: "/products",
  tags: ["catalogue"],
  request: {
    query: z.object({
      q: z
        .string("Enter a search term")
        .trim()
        .min(1, "Enter a search term")
        .openapi({ param: { name: "q", in: "query" }, example: "backpack" }),
    }),
  },
  responses: {
    200: {
      description: "Products whose name or description contains the term",
      content: { "application/json": { schema: z.array(ProductSchema) } },
    },
    400: {
      description: "The search term is missing or blank",
      content: { "application/json": { schema: ValidationFailedSchema } },
    },
    502: {
      description: "The catalogue provider is unavailable",
      content: { "application/json": { schema: CatalogueUnavailableSchema } },
    },
  },
});

export function products(catalogue: CatalogueSource) {
  return createRouter()
    .openapi(searchProducts, async (c) => {
      const { q } = c.req.valid("query");
      const term = q.toLowerCase();
      const matches = (text: string) => text.toLowerCase().includes(term);
      const all = await catalogue.listProducts();
      return c.json(
        all.filter((p) => matches(p.name) || matches(p.description)),
        200,
      );
    })
    .openapi(getProduct, async (c) => {
      const { id } = c.req.valid("param");
      return c.json(await catalogue.getProduct(id), 200);
    });
}
