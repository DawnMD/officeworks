import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import type { CatalogueSource } from "./catalogue/catalogue-source.js";
import {
  CatalogueUnavailableSchema,
  NotFoundSchema,
  onError,
  ValidationFailedSchema,
} from "./http/errors.js";
import { health } from "./routes/health.js";

export type AppDeps = {
  corsOrigins: string[];
  catalogue: CatalogueSource;
};

export function createApp(deps: AppDeps) {
  const app = new OpenAPIHono();

  app.use(logger());
  app.use(cors({ origin: deps.corsOrigins, credentials: true }));

  app.onError(onError);
  app.openAPIRegistry.register("NotFound", NotFoundSchema);
  app.openAPIRegistry.register(
    "CatalogueUnavailable",
    CatalogueUnavailableSchema,
  );
  app.openAPIRegistry.register("ValidationFailed", ValidationFailedSchema);

  app.route("/", health);

  app.doc31("/openapi.json", {
    openapi: "3.1.0",
    info: { title: "officeworks API", version: "0.1.0" },
  });
  app.get("/docs", swaggerUI({ url: "/openapi.json" }));

  return app;
}

export type AppType = ReturnType<typeof createApp>;
