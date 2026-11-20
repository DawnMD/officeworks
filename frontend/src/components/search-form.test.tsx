import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SearchForm } from "./search-form";

describe("SearchForm", () => {
  it("submits the term as q with a GET to /search", () => {
    render(<SearchForm />);

    const input = screen.getByRole<HTMLInputElement>("searchbox", {
      name: "Search products",
    });
    expect(input).toHaveAttribute("name", "q");
    expect(input.form).toHaveAttribute("method", "get");
    expect(input.form).toHaveAttribute("action", "/search");
  });

  it("requires a term before it can be submitted", () => {
    render(<SearchForm />);

    expect(
      screen.getByRole("searchbox", { name: "Search products" }),
    ).toBeRequired();
  });

  it("shows the current term", () => {
    render(<SearchForm defaultValue="backpack" />);

    expect(
      screen.getByRole("searchbox", { name: "Search products" }),
    ).toHaveValue("backpack");
  });
});
