import type { ReactNode } from "react";
import type { CategoryLink } from "../category-links";
import { FeaturedProducts } from "./featured-products";
import { ProductGrid } from "./product-grid";
import type { ProductTileProps } from "./product-tile";

/** A Category's Featured products ("Top rated"), then its Additional products. */
export function CategoryProducts({
  category,
  featured,
  additional,
}: {
  category: CategoryLink;
  featured: ProductTileProps[];
  additional: ProductTileProps[];
}) {
  return (
    <div className="flex flex-col gap-12">
      {featured.length > 0 && <FeaturedProducts products={featured} />}
      <MoreInCategorySection name={category.name}>
        <ProductGrid products={additional} />
      </MoreInCategorySection>
    </div>
  );
}

export function MoreInCategorySection({
  name,
  children,
}: {
  name: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby="more-in-category" className="flex flex-col gap-6">
      <h2 id="more-in-category" className="text-2xl font-semibold">
        More in {name}
      </h2>
      {children}
    </section>
  );
}
