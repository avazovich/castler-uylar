// Domain isn't chosen yet — set NEXT_PUBLIC_SITE_URL on the host once it is.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3333";

// Facts shared with castler.uz (see castler-site/lib/siteConfig.ts).
export const MAIN_SITE_URL = "https://www.castler.uz";
export const FOUNDING_YEAR = 2013;
export const AREA_REALIZED_M2 = 300000;

// Fallbacks for when the Site settings document hasn't been filled in.
export const DEFAULT_PHONE = "+998 77 000 16 00";
export const DEFAULT_INSTAGRAM_URL = "https://www.instagram.com/castler.uz";
