export type Category = { slug: string; name: string };

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: Category;
  rating: { rate: number; count: number };
};

/** The product or category asked for does not exist. */
export class NotFoundError extends Error {
  override name = "NotFoundError";
}

/** The catalogue provider timed out, could not be reached, or returned an error. */
export class CatalogueUnavailableError extends Error {
  override name = "CatalogueUnavailableError";
}

/** The one way routes read the Catalogue. */
export interface CatalogueSource {
  listProducts(): Promise<Product[]>;
  /** Throws `NotFoundError` if there is no product with this id. */
  getProduct(id: number): Promise<Product>;
  listCategories(): Promise<Category[]>;
  /** Throws `NotFoundError` if no category has this slug. */
  listProductsInCategory(slug: string): Promise<Product[]>;
}
