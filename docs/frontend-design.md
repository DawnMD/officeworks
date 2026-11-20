# Frontend design

Design for the officeworks storefront frontend (`frontend/`), agreed before implementation. Terms in **bold** are defined in [`GLOSSARY.md`](../GLOSSARY.md). The API it consumes is described in [`backend-design.md`](backend-design.md).

## Delivery

Each user story is a vertical slice on its own branch and PR (`feat/<issue>-<name>`): the backend route and its tests, then `pnpm gen:api`, then the frontend page. The order is:

1. Product page
2. Home page
3. Category page
4. Search
5. Enquiry

## Routes

| Route | Shows | Data |
| --- | --- | --- |
| `/` | The home-page **Featured products** under the heading "Top rated" | `GET /home` |
| `/categories/[slug]` | A "Top rated" section (the category's **Featured products**, hidden if there are none), then "More in {category}" (its **Additional products**) | `GET /categories/{slug}` |
| `/search?q=…` | **Products** matching the term, or "No products match '…'" | `GET /products?q=` |
| `/products/[id]` | One **Product**'s details and the **Enquire** button | `GET /products/{id}` |

Products are addressed by the provider's numeric id; there are no product slugs.

## Layout

A shared header in the root layout holds:

- the store name, which links to `/`
- one link for each **Category**, from `GET /categories`
- the search bar

### Search bar

- A native `<form method="get" action="/search">` with a `required` input named `q`. It works without JavaScript, and an empty search never reaches the backend.
- Search runs when the customer submits the form, not as they type.
- On `/search`, the input shows the current term.

## Product display

- **Product tile**: image, name and price. The whole tile links to `/products/[id]`.
- **Product page**: image, name, price, description, **Category** (linked) and **Rating**, plus the **Enquire** button.
- Prices have no currency from the provider. They are displayed as AUD with `Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" })`.
- Images use `next/image`, with the provider's `/img/**` path under `FAKE_STORE_URL` allowed in `images.remotePatterns`. `.env.example` points it at the public Fake Store API.

## Data fetching and caching

- Catalogue pages are Server Components. They reach the backend through the typed `openapi-fetch` client using `API_URL`.
- Catalogue reads (home, categories, category, product) are cached on the server with `"use cache"` and a lifetime of about 5 minutes.
- Search results are not cached.
- Any uncached data sits inside `<Suspense>`, as `cacheComponents` requires. Product grids show a skeleton grid of shadcn `Skeleton` tiles while they load, and the product page shows a skeleton of its own layout.
- TanStack Query is **not** used for catalogue reads. Adding it would create a second cache on top of Next's.

### Errors

- A `404` (unknown product or category) calls `notFound()`.
- A `502 catalogue_unavailable` reaches an `error.tsx` boundary, which says "We can't load products right now" and offers a retry button.

## Enquiry

The **Enquire** button on the product page opens a shadcn (Base UI) Dialog titled "Enquire about {product name}".

### Form

- Fields: name (required), email (required, must be a valid email), phone (optional), message (optional), and a hidden `website` honeypot.
- Built with react-hook-form, `@hookform/resolvers` and a hand-written zod v4 `enquirySchema` that matches the backend's rules. The backend is still the authority: field errors from its `400` response are mapped onto the form with `setError`.

### Submission

- The form is a Client Component. It POSTs straight from the browser to the backend (`NEXT_PUBLIC_API_URL`, allowed by CORS) through a TanStack Query `useMutation`.
- It does not go through a Server Action. The backend rate-limits by client IP, and a Server Action would make every enquiry appear to come from the Next server's single IP.
- So this form needs JavaScript to work.

### States

| Outcome | Customer sees |
| --- | --- |
| Pending | The submit button is disabled and reads "Sending…" |
| `201` | The dialog content changes to "Thank you, our sales team will be in touch". Closing the dialog clears the form. |
| `400` | The error from `fields` appears next to each failing field, and the entered values are kept |
| `404` | "This product is no longer available." |
| `429` | "You've sent several enquiries recently. Please try again in a few minutes." |
| `502` or network failure | "We couldn't send your enquiry. Please try again." The entered values are kept. |

"Thank you" is never shown for an enquiry that wasn't delivered.

## Styling

- shadcn/ui, initialised with `--preset buFyyzw` on Base UI.
- The preset's theme replaces the current hand-written `globals.css` theme and font setup.

## Testing

- Vitest with Testing Library and jsdom.
- Tests cover the interactive parts:
  - the enquiry form: success, `400` field errors, `429`, and `502`
  - the search form
- There is no end-to-end suite for now.
