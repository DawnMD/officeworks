import { describe, expect, it } from "vitest";
import { parseEnv } from "./env.js";

const valid = { FAKE_STORE_URL: "https://provider.test" };

describe("parseEnv", () => {
  it("saves enquiries to data/enquiries.csv by default", () => {
    expect(parseEnv(valid).enquiriesCsvPath).toBe("data/enquiries.csv");
  });

  it("saves enquiries to ENQUIRIES_CSV_PATH when it is set", () => {
    expect(
      parseEnv({ ...valid, ENQUIRIES_CSV_PATH: "/var/lib/officeworks/e.csv" })
        .enquiriesCsvPath,
    ).toBe("/var/lib/officeworks/e.csv");
  });

  it("rejects a missing FAKE_STORE_URL", () => {
    expect(() => parseEnv({})).toThrow(
      "Missing required environment variable FAKE_STORE_URL",
    );
  });
});
