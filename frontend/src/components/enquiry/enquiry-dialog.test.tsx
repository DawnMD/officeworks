import { screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { server } from "@/test/msw/server";
import { renderWithProviders } from "@/test/render";
import { EnquiryDialog } from "./enquiry-dialog";

const backpack = { id: 1, name: "Fjallraven Foldsack No. 1 Backpack" };

/** Answers POST /enquiries with `response`, and records each request body it receives. */
function enquiriesRespond(response: () => Response | Promise<Response>) {
  const bodies: unknown[] = [];
  server.use(
    http.post("*/enquiries", async ({ request }) => {
      bodies.push(await request.json());
      return response();
    }),
  );
  return bodies;
}

async function openAndFill(
  user: ReturnType<typeof renderWithProviders>["user"],
) {
  await user.click(screen.getByRole("button", { name: "Enquire" }));
  await user.type(screen.getByLabelText("Name"), "Ada Lovelace");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Phone (optional)"), "0400 000 000");
  await user.type(
    screen.getByLabelText("Message (optional)"),
    "Is this waterproof?",
  );
}

describe("EnquiryDialog", () => {
  it("posts the enquiry, with the empty honeypot, and thanks the customer", async () => {
    const bodies = enquiriesRespond(() =>
      HttpResponse.json({ status: "saved" }, { status: 201 }),
    );
    const { user } = renderWithProviders(<EnquiryDialog product={backpack} />);

    await openAndFill(user);
    await user.click(screen.getByRole("button", { name: "Send enquiry" }));

    expect(
      await screen.findByText("Thank you, our sales team will be in touch"),
    ).toBeInTheDocument();
    expect(bodies).toEqual([
      {
        productId: 1,
        name: "Ada Lovelace",
        email: "ada@example.com",
        phone: "0400 000 000",
        message: "Is this waterproof?",
        website: "",
      },
    ]);
  });

  it("starts a fresh, empty form when reopened after a successful enquiry", async () => {
    enquiriesRespond(() =>
      HttpResponse.json({ status: "saved" }, { status: 201 }),
    );
    const { user } = renderWithProviders(<EnquiryDialog product={backpack} />);

    await openAndFill(user);
    await user.click(screen.getByRole("button", { name: "Send enquiry" }));
    await screen.findByText("Thank you, our sales team will be in touch");
    await user.click(screen.getByRole("button", { name: "Close" }));
    await user.click(screen.getByRole("button", { name: "Enquire" }));

    expect(
      await screen.findByRole("button", { name: "Send enquiry" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveValue("");
    expect(screen.getByLabelText("Email")).toHaveValue("");
    expect(screen.getByLabelText("Message (optional)")).toHaveValue("");
  });

  it("disables the button and shows Sending… while the enquiry is in flight", async () => {
    let respond!: () => void;
    enquiriesRespond(
      () =>
        new Promise((resolve) => {
          respond = () =>
            resolve(HttpResponse.json({ status: "saved" }, { status: 201 }));
        }),
    );
    const { user } = renderWithProviders(<EnquiryDialog product={backpack} />);

    await openAndFill(user);
    await user.click(screen.getByRole("button", { name: "Send enquiry" }));

    expect(
      await screen.findByRole("button", { name: "Sending…" }),
    ).toBeDisabled();
    respond();
    expect(
      await screen.findByText("Thank you, our sales team will be in touch"),
    ).toBeInTheDocument();
  });

  it("shows the API's validation errors next to their fields, keeping what was typed", async () => {
    enquiriesRespond(() =>
      HttpResponse.json(
        {
          error: "validation_failed",
          fields: { email: "This address can't receive mail" },
        },
        { status: 400 },
      ),
    );
    const { user } = renderWithProviders(<EnquiryDialog product={backpack} />);

    await openAndFill(user);
    await user.click(screen.getByRole("button", { name: "Send enquiry" }));

    const email = screen.getByLabelText("Email");
    expect(
      await screen.findByText("This address can't receive mail"),
    ).toBeInTheDocument();
    expect(email).toHaveAccessibleDescription(
      "This address can't receive mail",
    );
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveValue("ada@example.com");
    expect(screen.getByLabelText("Name")).toHaveValue("Ada Lovelace");
  });

  it("says the product is gone when the API answers 404", async () => {
    enquiriesRespond(() =>
      HttpResponse.json({ error: "not_found" }, { status: 404 }),
    );
    const { user } = renderWithProviders(<EnquiryDialog product={backpack} />);

    await openAndFill(user);
    await user.click(screen.getByRole("button", { name: "Send enquiry" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "This product is no longer available.",
    );
    expect(
      screen.queryByText("Thank you, our sales team will be in touch"),
    ).not.toBeInTheDocument();
  });

  it.each([
    [
      "the API answers 502",
      () => HttpResponse.json({ error: "enquiry_not_saved" }, { status: 502 }),
    ],
    ["the network fails", () => HttpResponse.error()],
  ])(
    "asks the customer to try again when %s, keeping what was typed",
    async (_, response) => {
      enquiriesRespond(response);
      const { user } = renderWithProviders(
        <EnquiryDialog product={backpack} />,
      );

      await openAndFill(user);
      await user.click(screen.getByRole("button", { name: "Send enquiry" }));

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "We couldn't send your enquiry. Please try again.",
      );
      expect(screen.getByLabelText("Name")).toHaveValue("Ada Lovelace");
      expect(screen.getByLabelText("Message (optional)")).toHaveValue(
        "Is this waterproof?",
      );
      expect(
        screen.getByRole("button", { name: "Send enquiry" }),
      ).toBeEnabled();
    },
  );

  it("checks the fields before sending anything", async () => {
    const bodies = enquiriesRespond(() =>
      HttpResponse.json({ status: "saved" }, { status: 201 }),
    );
    const { user } = renderWithProviders(<EnquiryDialog product={backpack} />);

    await user.click(screen.getByRole("button", { name: "Enquire" }));
    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Send enquiry" }));

    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription(
      "Enter your name",
    );
    expect(screen.getByLabelText("Email")).toHaveAccessibleDescription(
      "Enter a valid email address",
    );
    expect(bodies).toEqual([]);
  });
});
