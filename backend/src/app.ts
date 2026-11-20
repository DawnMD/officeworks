import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { health } from "./routes/health.js";

export type AppDeps = {
  corsOrigins: string[];
};

export function createApp(deps: AppDeps) {
  const app = new OpenAPIHono();

  app.use(logger());
  app.use(cors({ origin: deps.corsOrigins, credentials: true }));

  app.route("/", health);

  app.doc31("/openapi.json", {
    openapi: "3.1.0",
    info: { title: "officeworks API", version: "0.1.0" },
  });
  app.get("/docs", swaggerUI({ url: "/openapi.json" }));

  return app;
}

export type AppType = ReturnType<typeof createApp>;
