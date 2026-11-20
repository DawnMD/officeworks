import { z } from "@hono/zod-openapi";
import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import {
  CatalogueUnavailableError,
  NotFoundError,
} from "../catalogue/catalogue-source.js";
import { EnquiryNotSavedError } from "../enquiries/enquiry-store.js";

export const NotFoundSchema = z
  .object({ error: z.literal("not_found") })
  .openapi("NotFound");

export const CatalogueUnavailableSchema = z
  .object({ error: z.literal("catalogue_unavailable") })
  .openapi("CatalogueUnavailable");

export const EnquiryNotSavedSchema = z
  .object({ error: z.literal("enquiry_not_saved") })
  .openapi("EnquiryNotSaved");

/** Maps catalogue and enquiry errors thrown by any route to the shared error responses. */
export const onError: ErrorHandler = (err, c) => {
  if (err instanceof NotFoundError) {
    return c.json({ error: "not_found" as const }, 404);
  }
  if (err instanceof CatalogueUnavailableError) {
    console.error(err);
    return c.json({ error: "catalogue_unavailable" as const }, 502);
  }
  if (err instanceof EnquiryNotSavedError) {
    console.error(err);
    return c.json({ error: "enquiry_not_saved" as const }, 502);
  }
  if (err instanceof HTTPException) return err.getResponse();
  console.error(err);
  return c.text("Internal Server Error", 500);
};

export const ValidationFailedSchema = z
  .object({
    error: z.literal("validation_failed"),
    fields: z.record(z.string(), z.string()),
  })
  .openapi("ValidationFailed");

export type ValidationFailed = z.infer<typeof ValidationFailedSchema>;

/** Turns zod issues into `{ field: message }`, keeping the first message per field. */
export function validationFailed(error: z.ZodError): ValidationFailed {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = issue.path.join(".");
    fields[field] ??= issue.message;
  }
  return { error: "validation_failed", fields };
}
