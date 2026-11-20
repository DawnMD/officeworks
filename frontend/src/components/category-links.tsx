import Link from "next/link";

export type CategoryLink = { slug: string; name: string };

/** One link per Category, to its category page. */
export function CategoryLinks({ categories }: { categories: CategoryLink[] }) {
  return (
    <nav aria-label="Categories" className="flex flex-1 flex-wrap gap-4">
      {categories.map(({ slug, name }) => (
        <Link
          key={slug}
          href={`/categories/${slug}`}
          className="text-muted-foreground text-sm capitalize hover:text-foreground"
        >
          {name}
        </Link>
      ))}
    </nav>
  );
}
