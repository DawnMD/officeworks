import { handle } from "hono/aws-lambda";
import { createApp } from "./app.js";
import { createFakeStoreCatalogue } from "./catalogue/fake-store.js";
import { checkFeaturedConfig, featured } from "./catalogue/featured.js";
import { createCsvEnquiryStore } from "./enquiries/csv.js";
import { parseEnv } from "./env.js";

const env = parseEnv(process.env);

// Entry point for AWS Lambda (API Gateway / Function URL). Not used by the Node server.
export const handler = handle(
  createApp({
    corsOrigins: env.corsOrigins,
    catalogue: createFakeStoreCatalogue({ fetch, baseUrl: env.fakeStoreUrl }),
    featured: checkFeaturedConfig(featured),
    enquiries: createCsvEnquiryStore(env.enquiriesCsvPath),
  }),
);
