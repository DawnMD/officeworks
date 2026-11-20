import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="text-muted-foreground text-sm">
        The product or category may no longer be available.
      </p>
      <Button render={<Link href="/" />} nativeButton={false}>
        Back to the store
      </Button>
    </section>
  );
}
