import {
  type CatalogueSource,
  type Category,
  NotFoundError,
  type Product,
} from "./catalogue-source.js";

/** A catalogue held in memory, for tests. Categories default to those the products use. */
export function createInMemoryCatalogue(
  products: Product[] = [],
  categories: Category[] = uniqueCategories(products),
): CatalogueSource {
  return {
    async listProducts() {
      return products;
    },
    async getProduct(id) {
      const product = products.find((p) => p.id === id);
      if (!product) throw new NotFoundError(`No product with id ${id}`);
      return product;
    },
    async listCategories() {
      return categories;
    },
    async listProductsInCategory(slug) {
      if (!categories.some((c) => c.slug === slug)) {
        throw new NotFoundError(`No category with slug ${slug}`);
      }
      return products.filter((p) => p.category.slug === slug);
    },
  };
}

function uniqueCategories(products: Product[]): Category[] {
  const bySlug = new Map(products.map((p) => [p.category.slug, p.category]));
  return [...bySlug.values()];
}
