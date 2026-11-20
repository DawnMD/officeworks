"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { SearchForm } from "./search-form";

/** The header's search bar; on /search it shows the current term. Render inside Suspense. */
export function HeaderSearch() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const term =
    pathname === "/search" ? (searchParams.get("q") ?? undefined) : undefined;

  // Keyed by term so the input resets when client navigation changes it.
  return <SearchForm key={term} defaultValue={term} />;
}
