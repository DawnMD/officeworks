import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "@/test/render";
import { ProductDetails } from "./product-details";

const backpack = {
  id: 1,
  name: "Fjallraven Foldsack No. 1 Backpack",
  description: "Your perfect pack for everyday use.",
  price: 109.95,
  imageUrl: "https://provider.test/img/81fPKd-2AYL._AC_SL1500_.jpg",
  category: { slug: "mens-clothing", name: "men's clothing" },
  rating: { rate: 3.9, count: 120 },
};

describe("ProductDetails", () => {
  it("shows the product's name, price in Australian dollars and description", () => {
    renderWithProviders(<ProductDetails product={backpack} />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Fjallraven Foldsack No. 1 Backpack",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("$109.95")).toBeInTheDocument();
    expect(
      screen.getByText("Your perfect pack for everyday use."),
    ).toBeInTheDocument();
  });

  it("shows the product's image, described by its name", () => {
    renderWithProviders(<ProductDetails product={backpack} />);

    expect(
      screen.getByRole("img", { name: "Fjallraven Foldsack No. 1 Backpack" }),
    ).toBeInTheDocument();
  });

  it("links the category name to its category page", () => {
    renderWithProviders(<ProductDetails product={backpack} />);

    expect(
      screen.getByRole("link", { name: "men's clothing" }),
    ).toHaveAttribute("href", "/categories/mens-clothing");
  });

  it("shows the product's rating and how many customers rated it", () => {
    renderWithProviders(<ProductDetails product={backpack} />);

    expect(
      screen.getByText("Rated 3.9 out of 5 (120 ratings)"),
    ).toBeInTheDocument();
  });

  it("opens the enquiry dialog for this product from the Enquire button", async () => {
    const { user } = renderWithProviders(<ProductDetails product={backpack} />);

    await user.click(screen.getByRole("button", { name: "Enquire" }));

    expect(
      screen.getByRole("dialog", {
        name: "Enquire about Fjallraven Foldsack No. 1 Backpack",
      }),
    ).toBeInTheDocument();
  });
});
