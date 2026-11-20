import { Button } from "@/components/ui/button";

/** A plain GET form to /search, so it works without JavaScript. */
export function SearchForm({ defaultValue }: { defaultValue?: string }) {
  return (
    <search>
      <form method="get" action="/search" className="flex gap-2">
        <input
          type="search"
          name="q"
          required
          defaultValue={defaultValue}
          aria-label="Search products"
          placeholder="Search products"
          className="border-input bg-background h-8 w-full min-w-0 border px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 sm:w-56"
        />
        <Button type="submit">Search</Button>
      </form>
    </search>
  );
}
