import { existsSync } from "node:fs";
import { defineConfig } from "vitest/config";

// Live tests read FAKE_STORE_URL from .env, which is never committed.
if (existsSync(".env")) process.loadEnvFile(".env");

export default defineConfig({
  test: {
    include: ["src/**/*.live.test.ts"],
    testTimeout: 15_000,
  },
});
