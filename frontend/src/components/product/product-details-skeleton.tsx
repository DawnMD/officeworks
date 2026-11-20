import { Skeleton } from "@/components/ui/skeleton";

/** The product page's layout while its product loads. */
export function ProductDetailsSkeleton() {
  return (
    <div
      role="status"
      className="grid gap-8 md:grid-cols-2"
      aria-busy="true"
      aria-label="Loading product"
    >
      <Skeleton className="aspect-square w-full rounded-xl" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
