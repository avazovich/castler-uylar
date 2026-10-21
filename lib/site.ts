// Domain isn't chosen yet — set NEXT_PUBLIC_SITE_URL on the host once it is.
// Every canonical URL, hreflang link, sitemap entry and structured-data URL
// is built from it, so a live site without it would point Google at localhost.
export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn("NEXT_PUBLIC_SITE_URL is not set — canonical URLs and the sitemap will point at localhost.");
}

// Facts shared with castler.uz (see castler-site/lib/siteConfig.ts).
export const MAIN_SITE_URL = "https://www.castler.uz";
export const FOUNDING_YEAR = 2013;
export const AREA_REALIZED_M2 = 300000;

// Fallbacks for when the Site settings document hasn't been filled in.
export const DEFAULT_PHONE = "+998 77 000 16 00";
export const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/castler.uz";

/**
 * "https://uylar.castler.uz." / " uylar.castler.uz/ " → "https://uylar.castler.uz".
 * Typos in the hosting dashboard (a trailing dot or slash, a missing
 * https://, stray spaces) must not leak into every URL we hand to Google.
 */
function normalizeSiteUrl(raw: string | undefined): string {
  const fallback = "http://localhost:3333";
  const trimmed = raw?.trim();
  if (!trimmed) return fallback;
  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
    url.hostname = url.hostname.replace(/\.+$/, "");
    return url.origin;
  } catch {
    return fallback;
  }
}
