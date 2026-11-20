import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  CategoryProducts,
  MoreInCategorySection,
} from "@/components/product/category-products";
import { TopRatedSection } from "@/components/product/featured-products";
import { ProductGridSkeleton } from "@/components/product/product-grid-skeleton";
import { getCategory } from "@/lib/catalogue";

export default function CategoryPage({
  params,
}: PageProps<"/categories/[slug]">) {
  return (
    <Suspense fallback={<CategorySkeleton />}>
      <Category params={params} />
    </Suspense>
  );
}

async function Category({
  params,
}: Pick<PageProps<"/categories/[slug]">, "params">) {
  const { slug } = await params;
  const page = await getCategory(slug);
  if (!page) notFound();

  return <CategoryProducts {...page} />;
}

function CategorySkeleton() {
  return (
    <div className="flex flex-col gap-12">
      <TopRatedSection>
        <ProductGridSkeleton count={3} />
      </TopRatedSection>
      <MoreInCategorySection name="…">
        <ProductGridSkeleton />
      </MoreInCategorySection>
    </div>
  );
}
