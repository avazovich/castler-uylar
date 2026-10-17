/**
 * 6600000 → "6 600 000"; 5.4 → "5,4" — the convention in both Uzbek and
 * Russian. Done by hand rather than Intl.NumberFormat("uz-UZ"): browsers
 * without Uzbek locale data fall back to "6,600,000", which then disagrees
 * with the server-rendered page.
 */
export function formatNumber(n: number): string {
  const rounded = Math.round(n * 10) / 10;
  const [int, frac] = Math.abs(rounded).toString().split(".");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0");
  return `${rounded < 0 ? "−" : ""}${grouped}${frac ? `,${frac}` : ""}`;
}

export function formatUsd(n: number): string {
  return `$${new Intl.NumberFormat("en-US").format(n)}`;
}

/** "+998 77 000 16 00" → "tel:+998770001600" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
