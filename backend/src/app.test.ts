import { describe, expect, it } from "vitest";
import { app } from "./app.js";

describe("api", () => {
  it("GET /health", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });

  it("GET /hello greets by name", async () => {
    const res = await app.request("/hello?name=Ada");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { message: string };
    expect(body.message).toBe("Hello, Ada!");
  });

  it("GET /hello rejects an empty name", async () => {
    const res = await app.request("/hello?name=");
    expect(res.status).toBe(400);
  });

  it("serves the OpenAPI spec", async () => {
    const res = await app.request("/openapi.json");
    const spec = (await res.json()) as { paths: Record<string, unknown> };
    expect(Object.keys(spec.paths)).toEqual(["/health", "/hello"]);
  });
});
