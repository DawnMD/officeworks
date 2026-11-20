import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const HelloQuery = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .optional()
    .openapi({ param: { name: "name", in: "query" }, example: "Ada" }),
});

const HelloSchema = z
  .object({ message: z.string(), timestamp: z.iso.datetime() })
  .openapi("Hello");

const route = createRoute({
  method: "get",
  path: "/hello",
  tags: ["example"],
  request: { query: HelloQuery },
  responses: {
    200: {
      description: "A greeting",
      content: { "application/json": { schema: HelloSchema } },
    },
  },
});

export const hello = new OpenAPIHono().openapi(route, (c) => {
  const { name = "world" } = c.req.valid("query");
  return c.json(
    { message: `Hello, ${name}!`, timestamp: new Date().toISOString() },
    200,
  );
});
