# syntax=docker/dockerfile:1
FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM deps AS build
COPY . .
# NEXT_PUBLIC_* values are inlined into the browser bundle at build time.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
# next.config.ts reads FAKE_STORE_URL at build time to allow product images from the provider.
ARG FAKE_STORE_URL
ENV FAKE_STORE_URL=$FAKE_STORE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

# For docker compose: builds when the container starts, not when the image is built.
# `next build` prerenders pages from the backend's data, so compose starts this only once the
# backend is up and healthy. NEXT_PUBLIC_API_URL, API_URL and FAKE_STORE_URL come from compose.
FROM deps AS local
COPY . .
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
EXPOSE 3000
CMD ["sh", "-c", "pnpm build && cp -r public .next/standalone/ && cp -r .next/static .next/standalone/.next/ && exec node .next/standalone/server.js"]

FROM node:24-alpine AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
WORKDIR /app
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
USER node
EXPOSE 3000
ENV PORT=3000 HOSTNAME=0.0.0.0
# API_URL (server-side backend address) is read at runtime.
CMD ["node", "server.js"]
