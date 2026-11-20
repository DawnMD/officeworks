import { Suspense } from "react";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { SearchResults } from "@/components/product/search-results";
import { searchProducts } from "@/lib/catalogue";

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <section className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">Search</h1>
      <Suspense fallback={<ProductGridSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function Results({
  searchParams,
}: Pick<PageProps<"/search">, "searchParams">) {
  const { q } = await searchParams;
  const term = (Array.isArray(q) ? q[0] : q)?.trim();
  // The form requires a term, but /search can still be opened directly.
  if (!term) {
    return (
      <p className="text-muted-foreground text-sm">
        Enter a search term to find products.
      </p>
    );
  }

  const products = await searchProducts(term);
  return <SearchResults term={term} products={products} />;
}
