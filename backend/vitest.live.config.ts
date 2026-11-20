import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Live tests read FAKE_STORE_URL; locally it comes from .env, as with `pnpm dev`.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  test: {
    include: ["src/**/*.live.test.ts"],
    testTimeout: 15_000,
  },
});
