/** One customer enquiry as it is recorded, with the product as it was when the enquiry arrived. */
export type EnquiryRecord = {
  receivedAt: string; // ISO 8601
  productId: number;
  productName: string;
  productPrice: number;
  name: string;
  email: string;
  phone: string;
  message: string;
};

/** Where enquiries are kept. `save` rejects if the enquiry was not recorded. */
export interface EnquiryStore {
  save(record: EnquiryRecord): Promise<void>;
}

/** The enquiry could not be recorded, so the customer must try again. */
export class EnquiryNotSavedError extends Error {
  override name = "EnquiryNotSavedError";
}
