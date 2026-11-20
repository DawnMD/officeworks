# Backend design

Design for the officeworks storefront backend (`backend/`), agreed before implementation. Terms in **bold** are defined in [`GLOSSARY.md`](../GLOSSARY.md).

## User stories covered

| Story | Behaviour |
| --- | --- |
| Home page | Customer sees the five home-page **Featured products** chosen by the merchant. |
| Category page | Customer sees the **Featured products** for a **Category**, plus its **Additional products**. |
| Search | Customer sees only **Products** whose text matches the search term. |
| Product page | Customer sees one **Product**'s details. |
| Enquiry | Customer submits contact details about a **Product**; the **Sales inbox** receives an email; the customer sees "Thank you". |

## Data source

- The **Catalogue** comes from [Fake Store API](https://fakestoreapi.com/). There is **no database**.
- The API holds 20 products in 4 categories (`electronics`, `jewelery`, `men's clothing`, `women's clothing`). A product has `id`, `title`, `price` (decimal), `description`, `category` (string), `image`, `rating { rate, count }`. There is no search, pagination (beyond `?limit=`), SKU or slug.
- **No caching** for now: every request calls the provider.
- Every provider call has a **5 s timeout**. A timeout or non-2xx response returns `502 { error: "catalogue_unavailable" }`.

### Boundary

The frontend never calls Fake Store directly. A `CatalogueSource` interface sits between the routes and the provider:

- `FakeStoreCatalogueSource`: the real adapter. It maps the provider's shape into our own `Product`.
- An in-memory fake, used in tests.

## Domain shapes

```ts
type Category = { slug: string; name: string };   // e.g. { slug: "mens-clothing", name: "men's clothing" }

type Product = {
  id: number;
  name: string;          // provider: title
  description: string;
  price: number;         // as provided
  imageUrl: string;      // provider: image
  category: Category;
  rating: { rate: number; count: number };
};
```

- Products are addressed by the provider's numeric `id`.
- Categories are addressed by a slug derived from the provider's name and mapped back to it when calling the provider.

## Featured products

- **Hand-picked by the merchant**, not derived from `rating`. The UI may label them "Top rated", but they have nothing to do with customer ratings. `rating` is display data only.
- They live in a typed module, `featured.ts`, so changing them means a code change. There are no admin endpoints and no auth for now.

  ```ts
  { home: [1, 5, 9, 12, 14], categories: { electronics: [9, 13], ... } }
  ```

- Limits: **home ≤ 5**, **each category ≤ 3**. These are checked at startup.
- If a configured ID is missing from the provider, it is skipped and a warning is logged. The list then shows fewer products; it does not fail.

## Endpoints

All routes are defined with `@hono/zod-openapi`, so they appear in `/openapi.json` and the frontend's generated types.

| Route | Response |
| --- | --- |
| `GET /home` | `{ featured: Product[] }`, at most 5, in configured order |
| `GET /categories` | `Category[]` |
| `GET /categories/{slug}` | `{ category, featured: Product[], additional: Product[] }`; `additional` leaves out the featured ones and keeps provider order; 404 for an unknown slug |
| `GET /products?q=` | `Product[]` whose `name` or `description` contains `q` (case-insensitive substring), filtered in the backend; 400 if `q` is empty |
| `GET /products/{id}` | `Product`; 404 if not found |
| `POST /enquiries` | See below |

No endpoint is paginated. The catalogue is small.

## Enquiries

Request body:

```ts
{
  productId: number;   // required
  name: string;        // required
  email: string;       // required, valid email
  phone?: string;
  message?: string;
  website?: string;    // honeypot; must be empty
}
```

Responses:

- `201`: the email was sent. The frontend shows "Thank you".
- `400`: validation failed. `404`: unknown product.
- `429`: rate-limited. The limit is **5 enquiries per IP per 10 minutes**, held in memory per instance.
- `502`: the email failed to send. Enquiries are not stored anywhere, so the customer must see an error and retry. The frontend never shows "Thank you" for an enquiry that wasn't delivered.
- Honeypot filled: return `201` but send nothing.

Email:

- To `SALES_INBOX`, from `MAIL_FROM`, with **Reply-To** set to the customer's email.
- Subject `New enquiry: {product name}`. The plain-text body holds the customer's details and the product's name, id and price.

`Mailer` interface:

- `SmtpMailer` (nodemailer), used when `SMTP_URL` is set.
- `ConsoleMailer`, used in local development when `SMTP_URL` is unset.
- `InMemoryMailer`, used in tests to check what was "sent".

## Configuration

| Env var | Purpose |
| --- | --- |
| `PORT`, `CORS_ORIGINS` | Existing |
| `SALES_INBOX` | Recipient of enquiry emails |
| `MAIL_FROM` | Sender address |
| `SMTP_URL` | SMTP connection string; unset means log emails to the console |

## Out of scope (for now)

Database, caching, admin and auth, product/category CRUD, pagination, full-text search ranking, CAPTCHA, and storing enquiries.
