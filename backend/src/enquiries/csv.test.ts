import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createCsvEnquiryStore } from "./csv.js";
import type { EnquiryRecord } from "./enquiry-store.js";

const ada: EnquiryRecord = {
  receivedAt: "2026-11-20T05:30:00.000Z",
  productId: 1,
  productName: "Fjallraven Foldsack No. 1 Backpack",
  productPrice: 109.95,
  name: "Ada Lovelace",
  email: "ada@example.com",
  phone: "0400 000 000",
  message: "Is this waterproof?",
};

const header =
  "received_at,product_id,product_name,product_price,name,email,phone,message";

let dir: string;
beforeEach(async () => {
  dir = await mkdtemp(join(tmpdir(), "enquiries-"));
});
afterEach(async () => {
  await rm(dir, { recursive: true, force: true });
});

describe("CSV enquiry store", () => {
  it("creates the file, and any missing folders, with a header row", async () => {
    const path = join(dir, "data", "enquiries.csv");

    await createCsvEnquiryStore(path).save(ada);

    expect(await readFile(path, "utf8")).toBe(
      `${header}\n` +
        "2026-11-20T05:30:00.000Z,1,Fjallraven Foldsack No. 1 Backpack,109.95,Ada Lovelace,ada@example.com,0400 000 000,Is this waterproof?\n",
    );
  });

  it("appends to the same file after a restart, without repeating the header", async () => {
    const path = join(dir, "enquiries.csv");
    const grace = { ...ada, name: "Grace Hopper", email: "grace@example.com" };

    await createCsvEnquiryStore(path).save(ada);
    await createCsvEnquiryStore(path).save(grace); // a new process, same file

    const lines = (await readFile(path, "utf8")).trimEnd().split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(header);
    expect(lines[1]).toContain("Ada Lovelace");
    expect(lines[2]).toContain("Grace Hopper");
  });

  it("quotes values containing commas, quotes or line breaks", async () => {
    const path = join(dir, "enquiries.csv");

    await createCsvEnquiryStore(path).save({
      ...ada,
      productName: "Backpack, 15 inch",
      name: 'Ada "Countess" Lovelace',
      message: "Line one\nLine two",
    });

    expect(await readFile(path, "utf8")).toBe(
      `${header}\n` +
        '2026-11-20T05:30:00.000Z,1,"Backpack, 15 inch",109.95,"Ada ""Countess"" Lovelace",ada@example.com,0400 000 000,"Line one\nLine two"\n',
    );
  });

  it("stops spreadsheet apps running a value as a formula", async () => {
    const path = join(dir, "enquiries.csv");

    await createCsvEnquiryStore(path).save({
      ...ada,
      name: '=HYPERLINK("http://evil.test")',
      message: "+61 400 000 000",
    });

    const row = (await readFile(path, "utf8")).split("\n")[1];
    expect(row).toContain(`"'=HYPERLINK(""http://evil.test"")"`);
    expect(row).toContain(",'+61 400 000 000");
  });

  it("keeps every enquiry when several are saved at once", async () => {
    const path = join(dir, "enquiries.csv");
    const store = createCsvEnquiryStore(path);

    await Promise.all(
      [1, 2, 3, 4, 5].map((n) => store.save({ ...ada, name: `Customer ${n}` })),
    );

    const lines = (await readFile(path, "utf8")).trimEnd().split("\n");
    expect(lines.filter((line) => line === header)).toHaveLength(1);
    expect(lines).toHaveLength(6);
  });
});
