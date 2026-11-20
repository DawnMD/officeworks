import createClient from "openapi-fetch";
import type { paths } from "./schema";

// Server-side code (Server Components, route handlers) reaches the backend via API_URL,
// which may be an internal address. Browser code uses NEXT_PUBLIC_API_URL.
const baseUrl =
  typeof window === "undefined"
    ? (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL)
    : process.env.NEXT_PUBLIC_API_URL;

export const api = createClient<paths>({
  baseUrl: baseUrl ?? "http://localhost:8787",
});
