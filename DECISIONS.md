# Decisions and assumptions

The decisions behind this proof of concept: what was assumed where the acceptance criteria left gaps, why the frontend is built the way it is, what was cut, and how the design grows. Setup and the design overview are in the [README](README.md).

## Assumptions where the criteria were unclear

- **The frontend build needs a running backend.** `next build` prerenders the catalogue pages from the backend's data, so they're fast from the first request. That's why `docker compose` starts the backend first and builds the frontend once the backend is healthy. The cost: the frontend image can't be built in isolation, and CI checks lint, types and tests rather than running a build.
- **"Top rated" means picked by the merchant**, not the provider's customer rating. The criterion says "I have chosen 5 products", so the picks are a typed config (`featured.ts`) and changing them is a code change. The rating is shown on the product only for information.
- **"Sales inbox" is an enquiry log for the PoC.** Each enquiry is appended to a CSV file instead of being emailed. Real email would need an account with an email provider, and the brief says the reviewer must not need one. It also says the email provider will change. `EnquiryStore` is the place to plug email in.
- **Search** is a case-insensitive substring match on product name and description. It runs when the customer submits the form, not as they type. An empty search is blocked.
- **Categories** are the provider's four flat categories, addressed by a URL slug (`mens-clothing`). A product belongs to exactly one category.
- **Prices** have no currency from the provider. They are shown as AUD.
- **Enquiry form fields**: name and email are required. Phone and message are optional.

## Frontend choices

- **Search is a plain HTML form, not React Hook Form.** The search bar has a single input that submits a GET request to `/search?q=…`. A form library earns its place when there's client-side state to manage: several fields, cross-field validation, server errors mapped onto fields. Search has none of that.
  - The browser already does what's needed. `required` stops an empty search ever reaching the backend, and the form submits with no JavaScript loaded.
  - The term lives in the URL, so results can be bookmarked, shared and reached with the back button, and the results page is rendered on the server.
  - It ships no extra JavaScript for the header, which is on every page.

  The enquiry form is different. It has several fields, validation that must match the backend's, server errors mapped onto each field, and pending, success and failure states. That's why it uses React Hook Form with zod.
- **Catalogue data is fetched in the page on the server, not in the browser like a single-page app.** The home, category, product and search pages are Server Components that call the backend while rendering.
  - The customer gets products in the first HTML response, not an empty shell that fills in later. That's faster on first load and can be indexed by search engines, which matters for a catalogue.
  - Pages that are cached or prerendered are served without a call to the backend. Catalogue reads are cached on the server for about 5 minutes with Next's `"use cache"`. A client cache such as TanStack Query would add a second cache on top of that, which is why it isn't used for reads.
  - Server-side rendering reaches the backend through `API_URL`, which can be a private address. The browser never needs to talk to the backend just to show products, so the backend stays the only place that calls the catalogue provider.
  - Loading and errors are handled per page: `<Suspense>` skeletons while data loads, `notFound()` for unknown products and categories, and an error boundary with a retry button when the catalogue is down.

  The one browser-side call is submitting an enquiry. It goes straight from the browser to the backend, so the backend's rate limit applies per customer IP, not to the Next server's single IP.

## Requirements dropped or simplified, and why

- **No email sending.** See above. Emails are replaced by the CSV log so the app runs with no accounts.
- **No admin UI or auth** for choosing featured products. Changing them is a code change, which is enough for a PoC with one merchant.
- **No database, caching layer in the backend, or pagination.** The catalogue has 20 products. The frontend caches catalogue reads for about 5 minutes.
- **No end-to-end tests.** The critical path is covered by backend route tests and frontend component tests that run against in-memory fakes. Live tests against Fake Store were removed so the tests don't depend on a third-party API.
- **Feature PRs were merged, not left open.** The brief asks for one PR into `main`, left open. Each user story was instead built on its own feature branch and PR, then merged into `main` so the next story could build on it. The review history is in the merged PRs: [#10](https://github.com/DawnMD/officeworks/pull/10) (app factory), [#15](https://github.com/DawnMD/officeworks/pull/15) (storefront shell), [#16](https://github.com/DawnMD/officeworks/pull/16) (catalogue source), [#17](https://github.com/DawnMD/officeworks/pull/17) (featured config), [#18](https://github.com/DawnMD/officeworks/pull/18) (product page), [#19](https://github.com/DawnMD/officeworks/pull/19) (search), [#20](https://github.com/DawnMD/officeworks/pull/20) (home page), [#21](https://github.com/DawnMD/officeworks/pull/21) (categories) and [#22](https://github.com/DawnMD/officeworks/pull/22) (enquiries). [#23](https://github.com/DawnMD/officeworks/pull/23) (env fix and submission docs) is left open as the PR to review.

## How it grows beyond the PoC

- Real catalogue: add a `CatalogueSource` adapter (database, PIM, Shopify, …) and pass it to `createApp` in `server.ts` and `lambda.ts`.
- Real email: add an `EnquiryStore` that sends to the sales inbox. You could also keep the CSV or a database as an audit log.
- Merchant-managed featured products: move `featured.ts` into storage behind an admin endpoint with auth.
- Deployment on AWS: the backend runs as a container (ECS/Fargate) or on Lambda (`src/lambda.ts`). The frontend is a Next.js standalone container, or runs on Vercel with Root Directory set to `frontend`.

## Next, with another day

- Send enquiries by email through a local SMTP catcher (e.g. Mailpit) in development and SES in production.
- Add a Playwright end-to-end test of the five journeys.
- Cache catalogue responses in the backend, and serve product images through the backend or a CDN.
