import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const HealthSchema = z.object({ status: z.literal("ok") }).openapi("Health");

const route = createRoute({
  method: "get",
  path: "/health",
  tags: ["system"],
  responses: {
    200: {
      description: "Service is healthy",
      content: { "application/json": { schema: HealthSchema } },
    },
  },
});

export const health = new OpenAPIHono().openapi(route, (c) =>
  c.json({ status: "ok" as const }, 200),
);
