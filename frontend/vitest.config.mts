import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // A host that can never resolve, so no test can reach a real backend.
    env: { NEXT_PUBLIC_API_URL: "http://api.test", API_URL: "http://api.test" },
  },
});
