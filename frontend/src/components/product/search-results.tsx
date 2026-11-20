import { ProductGrid } from "./product-grid";
import type { ProductTileProps } from "./product-tile";

export function SearchResults({
  term,
  products,
}: {
  term: string;
  products: ProductTileProps[];
}) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No products match &apos;{term}&apos;
      </p>
    );
  }
  return <ProductGrid products={products} />;
}
