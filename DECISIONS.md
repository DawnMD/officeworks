# Decisions and assumptions

This file covers what I assumed where the acceptance criteria left gaps, why the frontend works the way it does, what I cut, and how the design grows. Setup and the design overview are in the [README](README.md).

## Assumptions where the criteria were unclear

- **"Top rated" means picked by the merchant.** The criterion starts with "I have chosen 5 products", so it can't mean the provider's customer rating. The picks live in a typed config, `featured.ts`, and changing them is a code change. The product page still shows the rating, but only for information.
- **The sales inbox is a CSV enquiry log for now.** Real email needs an account with an email provider, and the brief says the reviewer must not need one. The brief also says the email provider will change. So each enquiry is appended to a CSV file, and email plugs in later behind the `EnquiryStore` interface.
- **Search matches text in the name or description.** It's a case-insensitive substring match. It runs when the customer presses Search, not on every keystroke, and an empty search never reaches the backend.
- **Categories are the provider's four flat categories.** Each has a URL slug such as `mens-clothing`, and a product belongs to exactly one.
- **Prices are AUD.** The provider gives numbers with no currency, so I picked one.
- **An enquiry needs a name and an email.** Phone and message are optional.

## Frontend choices

### Search is a plain HTML form, not React Hook Form

The search bar is one input in a form that sends a GET request to `/search?q=…`. A form library pays off when the client has state to manage, like several fields, rules that span fields, or server errors to put next to fields. Search has none of that, and the browser already covers what it needs.

- `required` stops an empty search before it leaves the page.
- The form works before any JavaScript loads.
- The term ends up in the URL. Results can be bookmarked and shared, the back button works, and the server renders the results page.
- The header is on every page, and this adds no JavaScript to it.

The enquiry form is the opposite case. It has four fields, validation that has to match the backend's, server errors mapped onto each field, and pending, success and failure states. That one does use React Hook Form with zod.

### Catalogue pages fetch on the server, not in the browser

The home, category, product and search pages are Server Components. They call the backend while rendering, so the first HTML response already has the products in it. A single-page app would send an empty shell and fill it in after a second round trip.

- The first load is faster, and search engines can index the products. For a catalogue, both matter.
- Next caches catalogue reads on the server for about 5 minutes with `"use cache"`. Adding TanStack Query on top would mean two caches that can disagree, so I only use it for the enquiry submit.
- The server reaches the backend through `API_URL`, which can be a private address. The browser never talks to the backend just to show products, and the backend stays the only thing that calls the catalogue provider.
- Each page handles its own loading and errors. Skeletons show while data loads, unknown products and categories get a 404 page, and a provider outage gets an error screen with a retry button.

The one call the browser makes is the enquiry submit. It goes straight to the backend, so the backend sees each customer's own IP and not the Next server's. If rate limiting ever gets built, it can count per customer.

### The frontend build needs a running backend

`next build` prerenders the catalogue pages from real backend data, so they're fast from the first request. The cost is that the frontend can't build on its own. That's why `docker compose` starts the backend, waits for it to report healthy, and only then builds the frontend. It's also why CI doesn't run a build.

## Requirements dropped or simplified, and why

- **No email.** The CSV log replaces it so the app runs with no accounts. See the sales inbox assumption above.
- **No admin screen for featured products.** Editing `featured.ts` is enough for one merchant during a PoC, and it avoids building auth.
- **No database, backend cache or pagination.** The catalogue has 20 products. The frontend's 5-minute cache covers the repeat reads.
- **No end-to-end tests.** Backend route tests and frontend component tests cover the critical path against in-memory fakes. I removed the live tests against Fake Store because a test suite that fails when someone else's API is down tells you nothing about your code.
- **No rate limiting or bot filtering on enquiries.** I designed it in [#9](https://github.com/DawnMD/officeworks/issues/9): 5 enquiries per IP per 10 minutes, and a hidden honeypot field that only bots fill in. I didn't build it. A limit held in one server's memory stops working once the backend runs as two instances or on Lambda, so doing it properly needs a shared store such as Redis or DynamoDB. That's a whole extra service for an assessment, and a PoC with no real traffic isn't going to get flooded. The form already sends the honeypot field, so the backend can start dropping bot submissions without a frontend change. I'd add the limit together with real email, because that's when a flood starts costing money.
- **The feature PRs are merged, not left open.** The brief asks for one PR into `main`, left open. I built each user story on its own branch and PR and merged it, so the next story could build on it. The review history is in those PRs:
  - [#10](https://github.com/DawnMD/officeworks/pull/10) app factory
  - [#15](https://github.com/DawnMD/officeworks/pull/15) storefront shell
  - [#16](https://github.com/DawnMD/officeworks/pull/16) catalogue source
  - [#17](https://github.com/DawnMD/officeworks/pull/17) featured config
  - [#18](https://github.com/DawnMD/officeworks/pull/18) product page
  - [#19](https://github.com/DawnMD/officeworks/pull/19) search
  - [#20](https://github.com/DawnMD/officeworks/pull/20) home page
  - [#21](https://github.com/DawnMD/officeworks/pull/21) categories
  - [#22](https://github.com/DawnMD/officeworks/pull/22) enquiries

  [#23](https://github.com/DawnMD/officeworks/pull/23) has the env fix, Docker setup and submission docs. It stays open as the PR to review.

## How it grows beyond the PoC

- **A real catalogue** is a new `CatalogueSource` adapter for a database, a PIM or Shopify, passed to `createApp` in `server.ts` and `lambda.ts`. Routes and frontend stay as they are.
- **Real email** is a new `EnquiryStore` that sends to the sales inbox. The CSV can stay as an audit log.
- **Merchant-managed featured products** means moving `featured.ts` into storage behind an admin endpoint with auth.
- **AWS deployment** works today. The backend runs as a container on ECS or Fargate, or on Lambda through `src/lambda.ts`. The frontend is a Next.js standalone container, or runs on Vercel with the Root Directory set to `frontend`.

## Next, with another day

- Send enquiries by email, through Mailpit locally and SES in production.
- Add Playwright tests for the five customer journeys.
- Cache catalogue responses in the backend, and serve product images through the backend or a CDN so the browser stops loading them from Fake Store.
