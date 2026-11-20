import { describe, expect, it } from "vitest";
import { createApp } from "../app.js";
import {
  type CatalogueSource,
  CatalogueUnavailableError,
  type Product,
} from "../catalogue/catalogue-source.js";
import { createInMemoryCatalogue } from "../catalogue/in-memory.js";
import type { EnquiryStore } from "../enquiries/enquiry-store.js";
import { createInMemoryEnquiryStore } from "../enquiries/in-memory.js";

const backpack: Product = {
  id: 1,
  name: "Fjallraven Foldsack No. 1 Backpack",
  description: "Your perfect pack for everyday use.",
  price: 109.95,
  imageUrl: "https://images.example/backpack.jpg",
  category: { slug: "mens-clothing", name: "men's clothing" },
  rating: { rate: 3.9, count: 120 },
};

const receivedAt = new Date("2026-11-20T05:30:00.000Z");

const appWith = ({
  catalogue = createInMemoryCatalogue([backpack]),
  enquiries = createInMemoryEnquiryStore(),
}: {
  catalogue?: CatalogueSource;
  enquiries?: EnquiryStore;
} = {}) =>
  createApp({
    corsOrigins: ["http://localhost:3000"],
    catalogue,
    featured: { home: [], categories: {} },
    enquiries,
    now: () => receivedAt,
  });

const postEnquiry = (app: ReturnType<typeof appWith>, body: unknown) =>
  app.request("/enquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("POST /enquiries", () => {
  it("saves the enquiry with the product's details and returns 201 saved", async () => {
    const enquiries = createInMemoryEnquiryStore();

    const res = await postEnquiry(appWith({ enquiries }), {
      productId: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
      phone: "0400 000 000",
      message: "Is this waterproof?",
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ status: "saved" });
    expect(enquiries.saved).toEqual([
      {
        receivedAt: "2026-11-20T05:30:00.000Z",
        productId: 1,
        productName: "Fjallraven Foldsack No. 1 Backpack",
        productPrice: 109.95,
        name: "Ada Lovelace",
        email: "ada@example.com",
        phone: "0400 000 000",
        message: "Is this waterproof?",
      },
    ]);
  });

  it("saves empty phone and message when the customer leaves them out", async () => {
    const enquiries = createInMemoryEnquiryStore();

    await postEnquiry(appWith({ enquiries }), {
      productId: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
    });

    expect(enquiries.saved[0]).toMatchObject({ phone: "", message: "" });
  });

  it("returns 400 validation_failed for each missing required field, and saves nothing", async () => {
    const enquiries = createInMemoryEnquiryStore();

    const res = await postEnquiry(appWith({ enquiries }), {});

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "validation_failed",
      fields: {
        productId: "Choose a product",
        name: "Enter your name",
        email: "Enter your email address",
      },
    });
    expect(enquiries.saved).toEqual([]);
  });

  it("returns 400 for values outside the length and format rules", async () => {
    const enquiries = createInMemoryEnquiryStore();

    const res = await postEnquiry(appWith({ enquiries }), {
      productId: 1,
      name: "a".repeat(101),
      email: "not-an-email",
      phone: "1".repeat(31),
      message: "m".repeat(2001),
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "validation_failed",
      fields: {
        name: "Use 100 characters or fewer",
        email: "Enter a valid email address",
        phone: "Use 30 characters or fewer",
        message: "Use 2000 characters or fewer",
      },
    });
    expect(enquiries.saved).toEqual([]);
  });

  it("returns 400 for a blank name", async () => {
    const res = await postEnquiry(appWith(), {
      productId: 1,
      name: "   ",
      email: "ada@example.com",
    });

    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "validation_failed",
      fields: { name: "Enter your name" },
    });
  });

  it("returns 404 not_found for an unknown product, and saves nothing", async () => {
    const enquiries = createInMemoryEnquiryStore();

    const res = await postEnquiry(appWith({ enquiries }), {
      productId: 999,
      name: "Ada Lovelace",
      email: "ada@example.com",
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: "not_found" });
    expect(enquiries.saved).toEqual([]);
  });

  it("returns 502 catalogue_unavailable when the catalogue is down, and saves nothing", async () => {
    const enquiries = createInMemoryEnquiryStore();
    const down: CatalogueSource = {
      ...createInMemoryCatalogue(),
      getProduct: () =>
        Promise.reject(new CatalogueUnavailableError("provider down")),
    };

    const res = await postEnquiry(appWith({ catalogue: down, enquiries }), {
      productId: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
    });

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "catalogue_unavailable" });
    expect(enquiries.saved).toEqual([]);
  });

  it("returns 502 enquiry_not_saved when the enquiry can't be saved", async () => {
    const failing: EnquiryStore = {
      save: () => Promise.reject(new Error("EACCES: permission denied")),
    };

    const res = await postEnquiry(appWith({ enquiries: failing }), {
      productId: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
    });

    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "enquiry_not_saved" });
  });

  it("accepts the empty website honeypot the storefront always sends", async () => {
    const enquiries = createInMemoryEnquiryStore();

    const res = await postEnquiry(appWith({ enquiries }), {
      productId: 1,
      name: "Ada Lovelace",
      email: "ada@example.com",
      website: "",
    });

    expect(res.status).toBe(201);
    expect(enquiries.saved).toHaveLength(1);
  });

  it("is described in the OpenAPI spec, including the website field", async () => {
    const res = await appWith().request("/openapi.json");
    const spec = (await res.json()) as {
      paths: Record<string, Record<string, unknown>>;
      components: { schemas: Record<string, { properties: object }> };
    };

    expect(spec.paths["/enquiries"]).toHaveProperty("post");
    expect(
      Object.keys(spec.components.schemas.Enquiry?.properties ?? {}),
    ).toEqual(["productId", "name", "email", "phone", "message", "website"]);
  });
});
