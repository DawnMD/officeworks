import { describe, expect, it } from "vitest";
import { formatPrice } from "./format-price";

describe("formatPrice", () => {
  it("shows a provider price as Australian dollars", () => {
    expect(formatPrice(109.95)).toBe("$109.95");
  });

  it("always shows cents and groups thousands", () => {
    expect(formatPrice(1000)).toBe("$1,000.00");
  });
});
