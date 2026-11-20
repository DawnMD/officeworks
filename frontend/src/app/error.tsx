"use client"; // Error boundaries must be Client Components

import { CatalogueError } from "@/components/catalogue-error";

// Reached when the catalogue provider is unavailable (502 catalogue_unavailable).
export default function ErrorPage({
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <CatalogueError retry={retry} />;
}
