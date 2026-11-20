# officeworks

One git repo holding two independent apps. There are no workspaces and no shared root `package.json`: each app has its own dependencies, lockfile, Dockerfile and CI workflow.

| App | Stack | Port |
| --- | --- | --- |
| [`backend/`](backend) | Hono on Node, zod-openapi, Swagger UI at `/docs` | 8787 |
| [`frontend/`](frontend) | Next.js (App Router), Tailwind, typed `openapi-fetch` client | 3000 |

Requires Node 24 and pnpm.

## Local development

```sh
# terminal 1
cd backend && cp .env.example .env && pnpm install && pnpm dev

# terminal 2
cd frontend && cp .env.example .env.local && pnpm install && pnpm dev
```

Open http://localhost:3000 (the frontend) and http://localhost:8787/docs (the API docs).

## API contract

The backend defines its routes with `@hono/zod-openapi` and serves the spec at `/openapi.json`. The frontend's types in `frontend/src/lib/api/schema.d.ts` are generated from that spec and committed. After you change a backend route, start the backend and run:

```sh
cd frontend && pnpm gen:api
```

## Deployment

- **backend**: `backend/Dockerfile` builds a Node container (ECS/Fargate, Fly, Railway, a VPS…). `src/lambda.ts` exports a handler for AWS Lambda.
- **frontend**: `frontend/Dockerfile` builds a Next.js standalone image for AWS or anywhere else. On Vercel, set the project's Root Directory to `frontend`.

Env vars: the backend reads `PORT` and `CORS_ORIGINS`; the frontend reads `API_URL` at runtime and `NEXT_PUBLIC_API_URL` at build time.
