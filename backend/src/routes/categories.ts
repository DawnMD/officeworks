import { createRoute, z } from "@hono/zod-openapi";
import {
  type CatalogueSource,
  NotFoundError,
} from "../catalogue/catalogue-source.js";
import { type FeaturedConfig, resolveFeatured } from "../catalogue/featured.js";
import { CatalogueUnavailableSchema, NotFoundSchema } from "../http/errors.js";
import { createRouter } from "../http/router.js";
import { CategorySchema, ProductSchema } from "./products.js";

const listCategories = createRoute({
  method: "get",
  path: "/categories",
  tags: ["catalogue"],
  responses: {
    200: {
      description: "Every Category in the catalogue",
      content: { "application/json": { schema: z.array(CategorySchema) } },
    },
    502: {
      description: "The catalogue provider is unavailable",
      content: { "application/json": { schema: CatalogueUnavailableSchema } },
    },
  },
});

const getCategory = createRoute({
  method: "get",
  path: "/categories/{slug}",
  tags: ["catalogue"],
  request: {
    params: z.object({
      slug: z.string().openapi({
        param: { name: "slug", in: "path" },
        example: "electronics",
      }),
    }),
  },
  responses: {
    200: {
      description:
        "The Category, its Featured products in configured order, and its Additional products in provider order",
      content: {
        "application/json": {
          schema: z
            .object({
              category: CategorySchema,
              featured: z.array(ProductSchema),
              additional: z.array(ProductSchema),
            })
            .openapi("CategoryPage"),
        },
      },
    },
    404: {
      description: "No category has this slug",
      content: { "application/json": { schema: NotFoundSchema } },
    },
    502: {
      description: "The catalogue provider is unavailable",
      content: { "application/json": { schema: CatalogueUnavailableSchema } },
    },
  },
});

export function categories(
  catalogue: CatalogueSource,
  featuredConfig: FeaturedConfig,
) {
  return createRouter()
    .openapi(listCategories, async (c) =>
      c.json(await catalogue.listCategories(), 200),
    )
    .openapi(getCategory, async (c) => {
      const { slug } = c.req.valid("param");
      const [all, inCategory, featured] = await Promise.all([
        catalogue.listCategories(),
        catalogue.listProductsInCategory(slug),
        resolveFeatured(catalogue, featuredConfig.categories[slug] ?? [], {
          category: slug,
          warn: console.warn,
        }),
      ]);
      const category = all.find((cat) => cat.slug === slug);
      if (!category) throw new NotFoundError(`No category with slug ${slug}`);
      const featuredIds = new Set(featured.map((p) => p.id));
      const additional = inCategory.filter((p) => !featuredIds.has(p.id));
      return c.json({ category, featured, additional }, 200);
    });
}
