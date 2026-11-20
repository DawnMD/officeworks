import { serve } from "@hono/node-server";
import { createApp } from "./app.js";
import { createFakeStoreCatalogue } from "./catalogue/fake-store.js";
import { checkFeaturedConfig, featured } from "./catalogue/featured.js";
import { createCsvEnquiryStore } from "./enquiries/csv.js";
import { parseEnv } from "./env.js";

const env = parseEnv(process.env);

const app = createApp({
  corsOrigins: env.corsOrigins,
  catalogue: createFakeStoreCatalogue({ fetch, baseUrl: env.fakeStoreUrl }),
  featured: checkFeaturedConfig(featured),
  enquiries: createCsvEnquiryStore(env.enquiriesCsvPath),
});

const server = serve({ fetch: app.fetch, port: env.port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
