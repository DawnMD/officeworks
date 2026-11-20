import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetails } from "@/components/product/product-details";
import { ProductDetailsSkeleton } from "@/components/product/product-details-skeleton";
import { getProduct } from "@/lib/catalogue";

export default function ProductPage({ params }: PageProps<"/products/[id]">) {
  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <Product params={params} />
    </Suspense>
  );
}

async function Product({
  params,
}: Pick<PageProps<"/products/[id]">, "params">) {
  const { id } = await params;
  // Only positive whole numbers are product ids; anything else can't exist.
  if (!/^[1-9]\d*$/.test(id)) notFound();

  const product = await getProduct(Number(id));
  if (!product) notFound();

  return <ProductDetails product={product} />;
}
