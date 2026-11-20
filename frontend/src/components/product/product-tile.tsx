import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/format-price";

export type ProductTileProps = {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
};

export function ProductTile({ id, name, price, imageUrl }: ProductTileProps) {
  return (
    <Link
      href={`/products/${id}`}
      className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Card className="h-full pt-0 transition-shadow group-hover:ring-foreground/30">
        <div className="relative aspect-square bg-white">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-6"
          />
        </div>
        <CardContent className="flex flex-1 flex-col gap-2">
          <h3 className="line-clamp-2 text-sm font-medium">{name}</h3>
          <p className="mt-auto text-sm font-semibold">{formatPrice(price)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
