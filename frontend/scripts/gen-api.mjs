// Regenerates src/lib/api/schema.d.ts from the backend's OpenAPI spec.
// Usage: pnpm gen:api   (backend must be running; override with API_URL)
//
// openapi-typescript needs the TypeScript compiler JS API, which TypeScript 7 (native) no longer
// ships, so it runs in an isolated `pnpm dlx` environment with TypeScript 5.
import { spawnSync } from "node:child_process";

const apiUrl = process.env.API_URL ?? "http://localhost:8787";
const result = spawnSync(
  "pnpm",
  [
    "dlx",
    "--package=openapi-typescript@7.13.0",
    "--package=typescript@5.9.3",
    "openapi-typescript",
    `${apiUrl}/openapi.json`,
    "-o",
    "src/lib/api/schema.d.ts",
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
);
process.exit(result.status ?? 1);
