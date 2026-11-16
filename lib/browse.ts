import type { Locale } from "@/i18n/routing";

export const browseSections = ["styles", "collections", "size", "cost", "guides", "faq", "consult"] as const;
export type BrowseSection = (typeof browseSections)[number];

/**
 * The build-cost calculator has its own address in each language, worded the
 * way people search for it: «uy qurish narxi kalkulyatori» in Uzbek,
 * «калькулятор строительства дома» in Russian. The old /browse/cost and the
 * other language's slug redirect here (next.config.ts).
 */
export const CALC_SLUG: Record<Locale, string> = {
  uz: "uy-qurish-narxi-kalkulyatori",
  ru: "kalkulyator-stroitelstva-doma",
};
export const calcPath = (locale: Locale) => `/${CALC_SLUG[locale]}`;

export const browsePath = (section: BrowseSection, locale: Locale) =>
  section === "cost" ? calcPath(locale) : `/browse/${section}`;
