const aud = new Intl.NumberFormat("en-AU", {
  style: "currency",
  currency: "AUD",
});

// The provider's prices carry no currency; the store shows them as AUD.
export function formatPrice(price: number): string {
  return aud.format(price);
}
