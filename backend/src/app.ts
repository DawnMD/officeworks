import { swaggerUI } from "@hono/swagger-ui";
import { OpenAPIHono } from "@hono/zod-openapi";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { env } from "./env.js";
import { health } from "./routes/health.js";
import { hello } from "./routes/hello.js";

export const app = new OpenAPIHono();

app.use(logger());
app.use(cors({ origin: env.corsOrigins, credentials: true }));

app.route("/", health);
app.route("/", hello);

app.doc31("/openapi.json", {
  openapi: "3.1.0",
  info: { title: "officeworks API", version: "0.1.0" },
});
app.get("/docs", swaggerUI({ url: "/openapi.json" }));

export type AppType = typeof app;
