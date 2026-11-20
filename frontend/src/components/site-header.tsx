import Link from "next/link";
import { Suspense } from "react";
import { getCategories } from "@/lib/catalogue";
import { CategoryLinks } from "./category-links";
import { HeaderSearch } from "./header-search";
import { SearchForm } from "./search-form";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          officeworks
        </Link>
        <Suspense fallback={<CategoryLinks categories={[]} />}>
          <HeaderCategories />
        </Suspense>
        <div className="w-full sm:w-auto">
          <Suspense fallback={<SearchForm />}>
            <HeaderSearch />
          </Suspense>
        </div>
      </div>
    </header>
  );
}

async function HeaderCategories() {
  // During a catalogue outage the header shows no links rather than breaking every page;
  // the page itself shows the catalogue error.
  const categories = await getCategories().catch(() => []);
  return <CategoryLinks categories={categories} />;
}
