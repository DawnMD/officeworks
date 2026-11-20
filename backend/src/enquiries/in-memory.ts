import type { EnquiryRecord, EnquiryStore } from "./enquiry-store.js";

/** An enquiry store for tests: it keeps every saved enquiry in `saved`. */
export function createInMemoryEnquiryStore(): EnquiryStore & {
  saved: EnquiryRecord[];
} {
  const saved: EnquiryRecord[] = [];
  return {
    saved,
    async save(record) {
      saved.push(record);
    },
  };
}
