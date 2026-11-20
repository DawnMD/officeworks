import { cacheLife } from "next/cache";
import { api } from "@/lib/api/client";

/** The product, or `null` if the catalogue has none with this id. Cached for about 5 minutes. */
export async function getProduct(id: number) {
  "use cache";
  cacheLife({ revalidate: 300 });

  const { data, response } = await api.GET("/products/{id}", {
    params: { path: { id } },
  });
  if (response.status === 404) return null;
  if (!data) {
    // 502 catalogue_unavailable (or anything unexpected): let the error boundary show it.
    throw new Error(`GET /products/${id} returned ${response.status}`);
  }
  return data;
}

/** Products whose name or description contains the term. Not cached: every search hits the backend. */
export async function searchProducts(term: string) {
  const { data, response } = await api.GET("/products", {
    params: { query: { q: term } },
  });
  if (!data) {
    // 502 catalogue_unavailable (or anything unexpected): let the error boundary show it.
    throw new Error(`GET /products?q= returned ${response.status}`);
  }
  return data;
}

/** The home page's Featured products, in configured order. Cached for about 5 minutes. */
export async function getHomeFeatured() {
  "use cache";
  cacheLife({ revalidate: 300 });

  const { data, response } = await api.GET("/home");
  if (!data) {
    // 502 catalogue_unavailable (or anything unexpected): let the error boundary show it.
    throw new Error(`GET /home returned ${response.status}`);
  }
  return data.featured;
}

/** Every Category, for the header links. Cached for about 5 minutes. */
export async function getCategories() {
  "use cache";
  cacheLife({ revalidate: 300 });

  const { data, response } = await api.GET("/categories");
  if (!data) {
    // 502 catalogue_unavailable (or anything unexpected): let the caller decide.
    throw new Error(`GET /categories returned ${response.status}`);
  }
  return data;
}

/** The Category with its Featured and Additional products, or `null` for an unknown slug. Cached for about 5 minutes. */
export async function getCategory(slug: string) {
  "use cache";
  cacheLife({ revalidate: 300 });

  const { data, response } = await api.GET("/categories/{slug}", {
    params: { path: { slug } },
  });
  if (response.status === 404) return null;
  if (!data) {
    // 502 catalogue_unavailable (or anything unexpected): let the error boundary show it.
    throw new Error(`GET /categories/${slug} returned ${response.status}`);
  }
  return data;
}
