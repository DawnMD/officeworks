import { Suspense } from "react";
import { api } from "@/lib/api/client";

async function ApiStatus() {
  const { data, error } = await api.GET("/health", { cache: "no-store" });

  if (error || !data) {
    return (
      <p className="text-red-600">
        Could not reach the API. Is the backend running on port 8787?
      </p>
    );
  }

  return <p className="text-2xl font-semibold">API status: {data.status}</p>;
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-8">
      <h1 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        officeworks
      </h1>
      <Suspense fallback={<p className="text-zinc-500">Calling the API…</p>}>
        <ApiStatus />
      </Suspense>
    </main>
  );
}
