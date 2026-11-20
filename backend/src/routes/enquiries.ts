import { createRoute, z } from "@hono/zod-openapi";
import type { CatalogueSource } from "../catalogue/catalogue-source.js";
import {
  EnquiryNotSavedError,
  type EnquiryStore,
} from "../enquiries/enquiry-store.js";
import {
  CatalogueUnavailableSchema,
  EnquiryNotSavedSchema,
  NotFoundSchema,
  ValidationFailedSchema,
} from "../http/errors.js";
import { createRouter } from "../http/router.js";

const EnquirySchema = z
  .object({
    productId: z.number("Choose a product").int().positive(),
    name: z
      .string("Enter your name")
      .trim()
      .min(1, "Enter your name")
      .max(100, "Use 100 characters or fewer"),
    email: z.email({
      error: (issue) =>
        issue.input === undefined
          ? "Enter your email address"
          : "Enter a valid email address",
    }),
    phone: z.string().trim().max(30, "Use 30 characters or fewer").optional(),
    message: z
      .string()
      .trim()
      .max(2000, "Use 2000 characters or fewer")
      .optional(),
    /** Honeypot: hidden from customers, so a human leaves it empty. Acted on in #9. */
    website: z.string().optional(),
  })
  .openapi("Enquiry");

const createEnquiry = createRoute({
  method: "post",
  path: "/enquiries",
  tags: ["enquiries"],
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: EnquirySchema } },
    },
  },
  responses: {
    201: {
      description: "The enquiry was saved for the sales team",
      content: {
        "application/json": {
          schema: z
            .object({ status: z.literal("saved") })
            .openapi("EnquirySaved"),
        },
      },
    },
    400: {
      description: "One or more fields are invalid",
      content: { "application/json": { schema: ValidationFailedSchema } },
    },
    404: {
      description: "No product has this id",
      content: { "application/json": { schema: NotFoundSchema } },
    },
    502: {
      description:
        "The enquiry was not saved: the catalogue provider is unavailable or the enquiry could not be recorded",
      content: {
        "application/json": {
          schema: z.union([CatalogueUnavailableSchema, EnquiryNotSavedSchema]),
        },
      },
    },
  },
});

export function enquiries(
  catalogue: CatalogueSource,
  store: EnquiryStore,
  now: () => Date,
) {
  return createRouter().openapi(createEnquiry, async (c) => {
    const enquiry = c.req.valid("json");
    const product = await catalogue.getProduct(enquiry.productId);
    try {
      await store.save({
        receivedAt: now().toISOString(),
        productId: product.id,
        productName: product.name,
        productPrice: product.price,
        name: enquiry.name,
        email: enquiry.email,
        phone: enquiry.phone ?? "",
        message: enquiry.message ?? "",
      });
    } catch (cause) {
      throw new EnquiryNotSavedError("Could not save the enquiry", { cause });
    }
    return c.json({ status: "saved" as const }, 201);
  });
}
