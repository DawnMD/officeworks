import type { ReactNode } from "react";
import { ProductGrid } from "./product-grid";
import type { ProductTileProps } from "./product-tile";

/** The merchant's Featured products, shown to customers as "Top rated". */
export function FeaturedProducts({
  products,
}: {
  products: ProductTileProps[];
}) {
  return (
    <TopRatedSection>
      <ProductGrid products={products} />
    </TopRatedSection>
  );
}

export function TopRatedSection({ children }: { children: ReactNode }) {
  return (
    <section aria-labelledby="top-rated" className="flex flex-col gap-6">
      <h1 id="top-rated" className="text-2xl font-semibold">
        Top rated
      </h1>
      {children}
    </section>
  );
}
