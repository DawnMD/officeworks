import { handle } from "hono/aws-lambda";
import { createApp } from "./app.js";
import { createFakeStoreCatalogue } from "./catalogue/fake-store.js";
import { env } from "./env.js";

// Entry point for AWS Lambda (API Gateway / Function URL). Not used by the Node server.
export const handler = handle(
  createApp({
    corsOrigins: env.corsOrigins,
    catalogue: createFakeStoreCatalogue({ fetch, baseUrl: env.fakeStoreUrl }),
  }),
);
