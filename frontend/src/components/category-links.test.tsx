import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CategoryLinks } from "./category-links";

describe("CategoryLinks", () => {
  it("links to each category's page by slug, labelled with its name", () => {
    render(
      <CategoryLinks
        categories={[
          { slug: "electronics", name: "electronics" },
          { slug: "mens-clothing", name: "men's clothing" },
        ]}
      />,
    );

    const nav = screen.getByRole("navigation", { name: "Categories" });
    const links = within(nav).getAllByRole("link");
    expect(links.map((l) => [l.textContent, l.getAttribute("href")])).toEqual([
      ["electronics", "/categories/electronics"],
      ["men's clothing", "/categories/mens-clothing"],
    ]);
  });
});
