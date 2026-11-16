import "server-only";
import { FALLBACK_USD } from "./prices";

/** Today's official dollar rate from the Central Bank of Uzbekistan, refreshed twice a day. */
export async function getUsdRate(): Promise<{ rate: number; date: string }> {
  try {
    const res = await fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/", {
      next: { revalidate: 43_200 },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return FALLBACK_USD;
    const [usd] = (await res.json()) as { Rate?: string; Date?: string }[];
    const rate = Number(usd?.Rate);
    return rate > 1000 && rate < 100_000 && usd?.Date ? { rate, date: usd.Date } : FALLBACK_USD;
  } catch {
    return FALLBACK_USD;
  }
}
