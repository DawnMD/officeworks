import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Live tests hit the real catalogue provider; they run with `pnpm test:live`.
    exclude: [...configDefaults.exclude, "**/*.live.test.ts"],
  },
});
