import {
  type CatalogueSource,
  CatalogueUnavailableError,
  type Category,
  NotFoundError,
  type Product,
} from "./catalogue-source.js";

type ProviderProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
};

const TIMEOUT_MS = 5_000;

export type FakeStoreDeps = {
  fetch: typeof fetch;
  /** The provider's origin, from `FAKE_STORE_URL`. */
  baseUrl: string;
};

export function createFakeStoreCatalogue({
  fetch,
  baseUrl,
}: FakeStoreDeps): CatalogueSource {
  async function get<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    let res: Response;
    let text: string;
    try {
      res = await fetch(`${baseUrl}${path}`, { signal: controller.signal });
      text = await res.text();
    } catch (cause) {
      throw new CatalogueUnavailableError(`GET ${path} failed`, { cause });
    } finally {
      clearTimeout(timer);
    }
    if (!res.ok) {
      throw new CatalogueUnavailableError(`GET ${path} returned ${res.status}`);
    }
    return (text ? JSON.parse(text) : null) as T;
  }

  async function listCategories() {
    const names = await get<string[]>("/products/categories");
    return names.map(toCategory);
  }

  return {
    listCategories,
    async listProducts() {
      const products = await get<ProviderProduct[]>("/products");
      return products.map(toProduct);
    },
    async getProduct(id) {
      const product = await get<ProviderProduct | null>(`/products/${id}`);
      if (!product) throw new NotFoundError(`No product with id ${id}`);
      return toProduct(product);
    },
    async listProductsInCategory(slug) {
      const category = (await listCategories()).find((c) => c.slug === slug);
      if (!category) throw new NotFoundError(`No category with slug ${slug}`);
      const products = await get<ProviderProduct[]>(
        `/products/category/${encodeURIComponent(category.name)}`,
      );
      return products.map(toProduct);
    },
  };
}

function toProduct(p: ProviderProduct): Product {
  return {
    id: p.id,
    name: p.title,
    description: p.description,
    price: p.price,
    imageUrl: p.image,
    category: toCategory(p.category),
    rating: { rate: p.rating.rate, count: p.rating.count },
  };
}

function toCategory(name: string): Category {
  const slug = name
    .toLowerCase()
    .replaceAll("'", "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return { slug, name };
}
