# Decisions and assumptions

The decisions behind this proof of concept: what was assumed where the acceptance criteria left gaps, what was cut, and how the design grows. Setup and the design overview are in the [README](README.md).

## Assumptions where the criteria were unclear

- **"Top rated" means picked by the merchant**, not the provider's customer rating. The criterion says "I have chosen 5 products", so the picks are a typed config (`featured.ts`) and changing them is a code change. The rating is shown on the product only for information.
- **"Sales inbox" is an enquiry log for the PoC.** Each enquiry is appended to a CSV file instead of being emailed. Real email would need an account with an email provider, and the brief says the reviewer must not need one. It also says the email provider will change. `EnquiryStore` is the place to plug email in.
- **Search** is a case-insensitive substring match on product name and description. It runs when the customer submits the form, not as they type. An empty search is blocked.
- **Categories** are the provider's four flat categories, addressed by a URL slug (`mens-clothing`). A product belongs to exactly one category.
- **Prices** have no currency from the provider. They are shown as AUD.
- **Enquiry form fields**: name and email are required. Phone and message are optional.

## Requirements dropped or simplified, and why

- **No email sending.** See above. Emails are replaced by the CSV log so the app runs with no accounts.
- **No admin UI or auth** for choosing featured products. Changing them is a code change, which is enough for a PoC with one merchant.
- **No database, caching layer in the backend, or pagination.** The catalogue has 20 products. The frontend caches catalogue reads for about 5 minutes.
- **No end-to-end tests.** The critical path is covered by backend route tests and frontend component tests that run against in-memory fakes. Live tests against Fake Store were removed so the tests don't depend on a third-party API.
- **No `docker compose`.** Each app has its own Dockerfile, but local setup is two terminals and two commands.

## How it grows beyond the PoC

- Real catalogue: add a `CatalogueSource` adapter (database, PIM, Shopify, …) and pass it to `createApp` in `server.ts` and `lambda.ts`.
- Real email: add an `EnquiryStore` that sends to the sales inbox. You could also keep the CSV or a database as an audit log.
- Merchant-managed featured products: move `featured.ts` into storage behind an admin endpoint with auth.
- Deployment on AWS: the backend runs as a container (ECS/Fargate) or on Lambda (`src/lambda.ts`). The frontend is a Next.js standalone container, or runs on Vercel with Root Directory set to `frontend`.

## Next, with another day

- Send enquiries by email through a local SMTP catcher (e.g. Mailpit) in development and SES in production.
- Add `docker-compose.yml` for one-command startup, and a Playwright end-to-end test of the five journeys.
- Cache catalogue responses in the backend, and serve product images through the backend or a CDN.
