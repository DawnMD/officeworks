import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchResults } from "./search-results";

const backpack = {
  id: 1,
  name: "Fjallraven Foldsack No. 1 Backpack",
  price: 109.95,
  imageUrl: "https://provider.test/img/81fPKd-2AYL._AC_SL1500_.jpg",
};

describe("SearchResults", () => {
  it("says nothing matched when there are no products", () => {
    render(<SearchResults term="submarine" products={[]} />);

    expect(
      screen.getByText("No products match 'submarine'"),
    ).toBeInTheDocument();
  });

  it("lists each matching product, linked to its page", () => {
    render(<SearchResults term="pack" products={[backpack]} />);

    expect(
      screen.getByRole("link", { name: /Fjallraven Foldsack No. 1 Backpack/ }),
    ).toHaveAttribute("href", "/products/1");
    expect(screen.queryByText(/No products match/)).not.toBeInTheDocument();
  });
});
