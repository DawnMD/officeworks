import { appendFile, mkdir, stat } from "node:fs/promises";
import { dirname } from "node:path";
import type { EnquiryRecord, EnquiryStore } from "./enquiry-store.js";

const columns = [
  ["received_at", "receivedAt"],
  ["product_id", "productId"],
  ["product_name", "productName"],
  ["product_price", "productPrice"],
  ["name", "name"],
  ["email", "email"],
  ["phone", "phone"],
  ["message", "message"],
] as const satisfies readonly (readonly [string, keyof EnquiryRecord])[];

/**
 * One CSV cell (RFC 4180). Text starting with = + - @ or a tab gets a leading ' so spreadsheet
 * apps show it as text instead of running it as a formula: these values come from customers.
 */
function cell(value: string | number): string {
  if (typeof value === "number") return String(value);
  const text = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

const toLine = (cells: readonly (string | number)[]) =>
  `${cells.map(cell).join(",")}\n`;

const header = toLine(columns.map(([name]) => name));

async function isMissingOrEmpty(path: string): Promise<boolean> {
  try {
    return (await stat(path)).size === 0;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return true;
    throw error;
  }
}

/**
 * Appends each enquiry as a row of the CSV file at `path`, creating the file (with a header row)
 * and its folder if they don't exist. An existing file is kept and appended to, so enquiries
 * survive restarts. Writes are queued so concurrent saves never interleave.
 */
export function createCsvEnquiryStore(path: string): EnquiryStore {
  let queue: Promise<unknown> = Promise.resolve();

  async function append(record: EnquiryRecord) {
    await mkdir(dirname(path), { recursive: true });
    const row = toLine(columns.map(([, key]) => record[key]));
    await appendFile(path, (await isMissingOrEmpty(path)) ? header + row : row);
  }

  return {
    save(record) {
      const write = queue.then(() => append(record));
      queue = write.catch(() => {}); // one failed write must not block the next
      return write;
    },
  };
}
