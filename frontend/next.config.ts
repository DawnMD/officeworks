import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for Docker/AWS; Vercel ignores this.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // Product images come from the catalogue provider.
    remotePatterns: [new URL("https://fakestoreapi.com/img/**")],
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
