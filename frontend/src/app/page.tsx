import { Suspense } from "react";
import { api } from "@/lib/api/client";

async function Greeting() {
  const { data, error } = await api.GET("/hello", {
    params: { query: { name: "officeworks" } },
    cache: "no-store",
  });

  if (error || !data) {
    return (
      <p className="text-red-600">
        Could not reach the API. Is the backend running on port 8787?
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-2xl font-semibold">{data.message}</p>
      <p className="text-sm text-zinc-500">Server time: {data.timestamp}</p>
    </div>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-6 p-8">
      <h1 className="text-sm font-medium uppercase tracking-wide text-zinc-500">
        officeworks
      </h1>
      <Suspense fallback={<p className="text-zinc-500">Calling the API…</p>}>
        <Greeting />
      </Suspense>
    </main>
  );
}
