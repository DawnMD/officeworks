import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for Docker/AWS; Vercel ignores this.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Product images come from the catalogue provider at FAKE_STORE_URL (see .env.example).
    remotePatterns: process.env.FAKE_STORE_URL
      ? [new URL(`${process.env.FAKE_STORE_URL}/img/**`)]
      : [],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
