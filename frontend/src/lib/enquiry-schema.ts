import { z } from "zod";

/** The customer-facing enquiry form. Mirrors the backend's rules; the backend still has the final say. */
export const enquirySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your name")
    .max(100, "Use 100 characters or fewer"),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address")
    .pipe(z.email("Enter a valid email address")),
  phone: z.string().trim().max(30, "Use 30 characters or fewer"),
  message: z.string().trim().max(2000, "Use 2000 characters or fewer"),
  /** Honeypot: hidden from people, so only bots fill it in. */
  website: z.string(),
});

export type EnquiryForm = z.infer<typeof enquirySchema>;

export const emptyEnquiry: EnquiryForm = {
  name: "",
  email: "",
  phone: "",
  message: "",
  website: "",
};
