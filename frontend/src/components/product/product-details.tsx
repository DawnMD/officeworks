import Image from "next/image";
import Link from "next/link";
import { EnquiryDialog } from "@/components/enquiry/enquiry-dialog";
import type { components } from "@/lib/api/schema";
import { formatPrice } from "@/lib/format-price";

export type Product = components["schemas"]["Product"];

export function ProductDetails({ product }: { product: Product }) {
  return (
    <article className="grid gap-8 md:grid-cols-2">
      <div className="relative aspect-square rounded-xl bg-white">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain p-8"
        />
      </div>
      <div className="flex flex-col gap-4">
        <Link
          href={`/categories/${product.category.slug}`}
          className="text-muted-foreground text-sm capitalize underline-offset-4 hover:underline"
        >
          {product.category.name}
        </Link>
        <h1 className="text-2xl font-semibold">{product.name}</h1>
        <p className="text-muted-foreground text-sm">
          {`Rated ${product.rating.rate} out of 5 (${product.rating.count} ratings)`}
        </p>
        <p className="text-xl font-semibold">{formatPrice(product.price)}</p>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {product.description}
        </p>
        <div>
          <EnquiryDialog product={product} />
        </div>
      </div>
    </article>
  );
}
