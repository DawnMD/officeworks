import { OpenAPIHono } from "@hono/zod-openapi";
import { validationFailed } from "./errors.js";

/** Every route group is built with this, so every 400 has the same body. */
export function createRouter() {
  return new OpenAPIHono({
    defaultHook: (result, c) => {
      if (!result.success) return c.json(validationFailed(result.error), 400);
    },
  });
}
