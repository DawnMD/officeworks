# officeworks

A product catalogue proof of concept. Customers browse the catalogue, search it, and send an enquiry about a product. It's built as a foundation that can grow, not a prototype to throw away: the product data source, the look and feel, and where enquiries go can each be swapped without rewriting the rest.

One git repo holds two independent apps. There is no shared root `package.json` and no workspace: each app has its own dependencies, lockfile, Dockerfile and CI workflow.

| App | Stack | Port |
| --- | --- | --- |
| [`backend/`](backend) | Node.js + TypeScript, Hono, `@hono/zod-openapi`, Swagger UI at `/docs` | 8787 |
| [`frontend/`](frontend) | React + TypeScript on Next.js (App Router), Tailwind, shadcn/ui, typed `openapi-fetch` client | 3000 |

## Stack choice and why

- **Client: React web app in TypeScript (Next.js).** A web app is the fastest way for the entrepreneur to try the PoC: they open a link, with no simulator or app store. Next.js renders catalogue pages on the server, so the pages are fast, can be indexed by search engines, and the search bar works without JavaScript.
- **Backend: Node.js in TypeScript (Hono).** It uses the same language as the client. Hono is small and runs on Node, in a container, or on AWS Lambda (`src/lambda.ts`) without code changes. `@hono/zod-openapi` makes each route's zod schema do three jobs: validate requests, publish the OpenAPI spec, and generate the frontend's types. The contract between the two apps is checked at compile time.

## Run it locally

Requires **Node 24** and **pnpm** (`corepack enable` gives you pnpm). Allow about 5 minutes. No accounts or paid services are needed: the catalogue comes from the public [Fake Store API](https://fakestoreapi.com).

```sh
# terminal 1: backend on http://localhost:8787
cd backend && cp .env.example .env && pnpm install && pnpm dev

# terminal 2: frontend on http://localhost:3000
cd frontend && cp .env.example .env.local && pnpm install && pnpm dev
```

Then open:

- http://localhost:3000: the storefront
- http://localhost:8787/docs: Swagger UI for the API (the spec is at `/openapi.json`)

The example env files work as they are. You don't need to change anything.

## Test

Each app has its own tests, run with Vitest. The backend uses in-memory fakes for the catalogue and the enquiry log, so the tests don't need the network.

```sh
cd backend  && pnpm test    # routes, catalogue adapter, featured config, CSV log, env parsing
cd frontend && pnpm test    # components: search form, product tiles/grids, enquiry dialog states

# Both apps also have:
pnpm lint        # Biome
pnpm typecheck   # tsc
```

CI (`.github/workflows/`) runs lint, typecheck and tests for each app when that app changes.

## Configuration

Every setting has a working default in the example env files. No secrets are committed or needed.

| App | Variable | Purpose | Example value |
| --- | --- | --- | --- |
| backend | `PORT` | Port the API listens on | `8787` |
| backend | `CORS_ORIGINS` | Comma-separated browser origins allowed to call the API | `http://localhost:3000` |
| backend | `FAKE_STORE_URL` | Origin of the catalogue provider (**required**) | `https://fakestoreapi.com` |
| backend | `ENQUIRIES_CSV_PATH` | CSV file every enquiry is appended to. It's created if missing. | `data/enquiries.csv` |
| frontend | `API_URL` | Backend URL for server-side rendering (read at runtime) | `http://localhost:8787` |
| frontend | `NEXT_PUBLIC_API_URL` | Backend URL for browser code (inlined at build time) | `http://localhost:8787` |
| frontend | `FAKE_STORE_URL` | Provider origin allowed for product images (`next/image`) | `https://fakestoreapi.com` |

**Featured ("Top rated") products** are picked in [`backend/src/catalogue/featured.ts`](backend/src/catalogue/featured.ts): up to 5 for the home page and up to 3 per category. The limits are checked at startup.

**Enquiries** are appended to `backend/data/enquiries.csv`. Open it to see what the sales team would receive.

## How the acceptance criteria are met

| Criterion | Where |
| --- | --- |
| Home page shows the 5 chosen "top rated" products | `/` ← `GET /home`. The picks are in `featured.ts`. |
| Category page shows top rated, then additional products | Header category links → `/categories/[slug]` ← `GET /categories/{slug}` |
| Search shows only products whose text matches the term | Header search bar → `/search?q=` ← `GET /products?q=`. Case-insensitive match on name or description, filtered in the backend. |
| Product tile opens the product details page | `/products/[id]` ← `GET /products/{id}` |
| Enquire → form → sales inbox receives it, customer sees "Thank you" | Enquire dialog on the product page → `POST /enquiries`. It's appended to the enquiry log (see the assumptions below). |

The client never calls Fake Store directly. All product data goes through the backend. Product images are the one exception: they are loaded from the provider's image URLs.

## Design

```
frontend (Next.js) ──HTTP/OpenAPI──▶ backend (Hono) ──▶ CatalogueSource ──▶ Fake Store API
                                                   └──▶ EnquiryStore    ──▶ CSV enquiry log
```

- **Swappable data source.** Routes depend on a `CatalogueSource` interface, not on Fake Store. `createFakeStoreCatalogue` maps the provider's data to our own `Product` shape. To use a real catalogue, add another adapter. The routes and the frontend don't change.
- **Swappable enquiry destination.** Enquiries go through an `EnquiryStore` interface. Today that's the CSV store (`createCsvEnquiryStore`). An email provider (SES, SendGrid, …) is another implementation of the same interface.
- **Swappable look and feel.** The UI is built from shadcn/ui components and theme tokens in `globals.css`, so a new visual design is mostly a theme change.
- **Typed contract.** The frontend's types in `frontend/src/lib/api/schema.d.ts` are generated from the backend's spec. After changing a backend route, start the backend and run `cd frontend && pnpm gen:api`.
- **Errors and safety.** The backend validates every request with zod and returns a shared `400 { error, fields }` shape that the form maps onto its fields. Each provider call has a 5-second timeout, and a provider failure returns `502`, which the UI shows as a retry message. Enquiries are rate-limited (5 per IP per 10 minutes) and have a honeypot field. CSV cells are protected against formula injection. "Thank you" is shown only once the enquiry is saved.

Full design notes: [`docs/backend-design.md`](docs/backend-design.md), [`docs/frontend-design.md`](docs/frontend-design.md), and the domain terms in [`GLOSSARY.md`](GLOSSARY.md).

## Decisions and AI usage

- [`DECISIONS.md`](DECISIONS.md): assumptions where the acceptance criteria were unclear, requirements dropped or simplified, how the design grows beyond the PoC, and what's next with another day.
- [`AI_USAGE.md`](AI_USAGE.md): tools and models used, agent instruction files, the plan, key prompts, and where the AI got things wrong.

## Time spent

<!-- TODO(author): fill in your actual time. -->

| Phase | Time |
| --- | --- |
| Planning | _TODO_ |
| Building | _TODO_ |
| Testing | _TODO_ |
| Reviewing | _TODO_ |
| **Total** | _TODO_ |

## Deployment

- **backend**: `backend/Dockerfile` builds a Node container (ECS/Fargate, Fly, Railway, a VPS, …). `src/lambda.ts` exports a handler for AWS Lambda. The image keeps the enquiry log on a `/app/data` volume. Lambda's filesystem is temporary, so use the container if enquiries matter.
- **frontend**: `frontend/Dockerfile` builds a Next.js standalone image. Pass `NEXT_PUBLIC_API_URL` as a build arg and `API_URL` at runtime. On Vercel, set the project's Root Directory to `frontend`.
