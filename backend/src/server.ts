import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { createFakeStoreCatalogue } from "./catalogue/fake-store.js";
import { env } from "./env.js";

const app = createApp({
  corsOrigins: env.corsOrigins,
  catalogue: createFakeStoreCatalogue({ fetch, baseUrl: env.fakeStoreUrl }),
});

const server = serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
