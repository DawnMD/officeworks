import type { CatalogueSource, Product } from "./catalogue-source.js";

/** The merchant's hand-picked Featured products, by product id, in display order. */
export type FeaturedConfig = {
  home: number[];
  /** Keyed by Category slug. */
  categories: Record<string, number[]>;
};

/** The shipped picks. Ids are Fake Store product ids; keys are Category slugs. */
export const featured: FeaturedConfig = {
  home: [1, 5, 9, 12, 14],
  categories: {
    electronics: [9, 13, 14],
    jewelery: [5, 7],
    "mens-clothing": [1, 3],
    "womens-clothing": [15, 17],
  },
};

const HOME_LIMIT = 5;
const CATEGORY_LIMIT = 3;

/** Returns the config unchanged, or throws if a list is over its limit. */
export function checkFeaturedConfig(config: FeaturedConfig): FeaturedConfig {
  if (config.home.length > HOME_LIMIT) {
    throw new Error(
      `Featured config: home lists ${config.home.length} products; the limit is ${HOME_LIMIT}`,
    );
  }
  for (const [slug, ids] of Object.entries(config.categories)) {
    if (ids.length > CATEGORY_LIMIT) {
      throw new Error(
        `Featured config: category "${slug}" lists ${ids.length} products; the limit is ${CATEGORY_LIMIT}`,
      );
    }
  }
  return config;
}

export type ResolveOptions = {
  /** For a category list: the Category slug every product must belong to. */
  category?: string;
  /** Called once for each configured id that is skipped. */
  warn: (message: string) => void;
};

/** Turns configured Featured product ids into Products, in configured order. */
export async function resolveFeatured(
  catalogue: CatalogueSource,
  ids: number[],
  options: ResolveOptions,
): Promise<Product[]> {
  const byId = new Map((await catalogue.listProducts()).map((p) => [p.id, p]));
  const featured: Product[] = [];
  for (const id of ids) {
    const product = byId.get(id);
    if (!product) {
      options.warn(
        `Featured product ${id} is not in the catalogue; skipping it`,
      );
      continue;
    }
    if (options.category && product.category.slug !== options.category) {
      options.warn(
        `Featured product ${id} is in category "${product.category.slug}", not "${options.category}"; skipping it`,
      );
      continue;
    }
    featured.push(product);
  }
  return featured;
}
