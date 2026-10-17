import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getHouses } from "@/lib/houses";
import { SITE_URL } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const houses = await getHouses(routing.defaultLocale);
  const paths = ["", "/loyihalar", ...houses.map((h) => `/loyihalar/${h.code}`)];
  return paths.map((path) => ({
    url: `${SITE_URL}/${routing.defaultLocale}${path}`,
    alternates: { languages: Object.fromEntries(routing.locales.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
  }));
}
