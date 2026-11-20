import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductTile } from "./product-tile";

const backpack = {
  id: 1,
  name: "Fjallraven Foldsack No. 1 Backpack",
  price: 109.95,
  imageUrl: "https://provider.test/img/81fPKd-2AYL._AC_SL1500_.jpg",
};

describe("ProductTile", () => {
  it("links the whole tile to the product page", () => {
    render(<ProductTile {...backpack} />);

    const link = screen.getByRole("link", { name: /Fjallraven Foldsack/ });
    expect(link).toHaveAttribute("href", "/products/1");
  });

  it("shows the product's name and its price in Australian dollars", () => {
    render(<ProductTile {...backpack} />);

    expect(
      screen.getByText("Fjallraven Foldsack No. 1 Backpack"),
    ).toBeInTheDocument();
    expect(screen.getByText("$109.95")).toBeInTheDocument();
  });
});
