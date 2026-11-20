import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryProducts } from "./category-products";

const tile = (id: number, name: string) => ({
  id,
  name,
  price: id * 10,
  imageUrl: `https://provider.test/img/${id}.jpg`,
});

const hardDrive = tile(9, "WD 2TB Elements Portable External Hard Drive");
const ssd = tile(10, "SanDisk SSD PLUS 1TB Internal SSD");
const monitor = tile(14, "Samsung 49-Inch CHG90 Curved Gaming Monitor");

const hrefsIn = (region: HTMLElement) =>
  within(region)
    .getAllByRole("link")
    .map((l) => l.getAttribute("href"));

describe("CategoryProducts", () => {
  it("shows the featured products under 'Top rated', then the rest under 'More in {category}'", () => {
    render(
      <CategoryProducts
        category={{ slug: "electronics", name: "electronics" }}
        featured={[monitor, hardDrive]}
        additional={[ssd]}
      />,
    );

    const topRated = screen.getByRole("region", { name: "Top rated" });
    const more = screen.getByRole("region", { name: "More in electronics" });
    expect(hrefsIn(topRated)).toEqual(["/products/14", "/products/9"]);
    expect(hrefsIn(more)).toEqual(["/products/10"]);
    expect(
      topRated.compareDocumentPosition(more) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("hides 'Top rated' when the category has no featured products", () => {
    render(
      <CategoryProducts
        category={{ slug: "jewelery", name: "jewelery" }}
        featured={[]}
        additional={[ssd]}
      />,
    );

    expect(screen.queryByText("Top rated")).not.toBeInTheDocument();
    expect(
      hrefsIn(screen.getByRole("region", { name: "More in jewelery" })),
    ).toEqual(["/products/10"]);
  });
});
