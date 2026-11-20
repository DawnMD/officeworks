import Link from "next/link";
import { Suspense } from "react";
import { HeaderSearch } from "./header-search";
import { SearchForm } from "./search-form";

export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          officeworks
        </Link>
        {/* Category links (#7) go here. */}
        <nav aria-label="Categories" className="flex flex-1 flex-wrap gap-4" />
        <div className="w-full sm:w-auto">
          <Suspense fallback={<SearchForm />}>
            <HeaderSearch />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
