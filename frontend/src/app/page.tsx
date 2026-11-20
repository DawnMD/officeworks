import { Suspense } from "react";
import {
  FeaturedProducts,
  TopRatedSection,
} from "@/components/product/featured-products";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { getHomeFeatured } from "@/lib/catalogue";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <TopRatedSection>
          <ProductGridSkeleton count={5} />
        </TopRatedSection>
      }
    >
      <Featured />
    </Suspense>
  );
}

async function Featured() {
  return <FeaturedProducts products={await getHomeFeatured()} />;
}
