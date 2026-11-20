"use client";

import { Button } from "@/components/ui/button";

export function CatalogueError({ retry }: { retry: () => void }) {
  return (
    <section className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-xl font-semibold">
        We can&apos;t load products right now
      </h1>
      <Button onClick={() => retry()}>Try again</Button>
    </section>
  );
}
