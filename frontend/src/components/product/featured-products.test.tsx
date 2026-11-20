import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FeaturedProducts } from "./featured-products";

const backpack = {
  id: 1,
  name: "Fjallraven Foldsack No. 1 Backpack",
  price: 109.95,
  imageUrl: "https://provider.test/img/backpack.jpg",
};

const ring = {
  id: 5,
  name: "John Hardy Women's Legends Naga Bracelet",
  price: 695,
  imageUrl: "https://provider.test/img/bracelet.jpg",
};

describe("FeaturedProducts", () => {
  it("shows the featured products under 'Top rated', in order, each linked to its page", () => {
    render(<FeaturedProducts products={[ring, backpack]} />);

    const section = screen.getByRole("region", { name: "Top rated" });
    const links = within(section).getAllByRole("link");
    expect(links.map((l) => l.getAttribute("href"))).toEqual([
      "/products/5",
      "/products/1",
    ]);
    expect(links[0]).toHaveAccessibleName(/John Hardy/);
  });
});
