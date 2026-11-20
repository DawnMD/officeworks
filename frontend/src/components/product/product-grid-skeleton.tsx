import { Skeleton } from "@/components/ui/skeleton";
import { gridClassName } from "./product-grid";

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul
      className={gridClassName}
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }, (_, i) => (
        // Placeholders have no identity; the index is a stable key here.
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholder list
        <li key={i} className="flex flex-col gap-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </li>
      ))}
    </ul>
  );
}
