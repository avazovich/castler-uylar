import type { MetadataRoute } from "next";
import { routing, type Locale } from "@/i18n/routing";
import { liveCollections } from "@/lib/collections";
import { getHouses, toSummary } from "@/lib/houses";
import { absoluteUrl, houseUrlPath } from "@/lib/seo";

// Built on every request: a cached sitemap kept the houses out for weeks after the
// sample data was replaced (it is a cached route handler by default). Crawlers ask rarely.
export const dynamic = "force-dynamic";

/**
 * Every page in every language, each listing its translations (and
 * x-default → Uzbek). Category pages are included while they have houses;
 * sample houses are left out (their pages are noindex — fake prices).
 * House entries carry their photos so they can show up in image search.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const houses = await getHouses(routing.defaultLocale);
  const summaries = houses.map(toSummary);
  const newest = (dates: (string | undefined)[]) =>
    dates.filter((d): d is string => Boolean(d)).sort().at(-1) ?? undefined;

  const entries = (
    path: (l: Locale) => string,
    extra: { lastModified?: string; images?: string[] } = {},
  ): MetadataRoute.Sitemap =>
    routing.locales.map((l) => ({
      url: absoluteUrl(path(l)),
      ...(extra.lastModified ? { lastModified: extra.lastModified } : {}),
      alternates: {
        languages: {
          ...Object.fromEntries(routing.locales.map((x) => [x, absoluteUrl(path(x))])),
          "x-default": absoluteUrl(path(routing.defaultLocale)),
        },
      },
      ...(extra.images?.length ? { images: extra.images } : {}),
    }));

  const latest = newest(houses.map((h) => h.updatedAt));
  const photo = (url: string) => `${url}?w=1600`;

  return [
    ...entries((l) => `/${l}`, { lastModified: latest }),
    ...entries((l) => `/${l}/loyihalar`, { lastModified: latest }),
    ...liveCollections(summaries).flatMap(({ collection, houses: list }) =>
      entries((l) => `/${l}/${collection.slug[l]}`, { lastModified: newest(list.map((h) => h.updatedAt)) }),
    ),
    ...houses
      .filter((h) => !h.isSample)
      .flatMap((h) =>
        entries((l) => houseUrlPath(h, l), {
          lastModified: h.updatedAt,
          images: [h.cover, ...h.gallery].map((img) => photo(img.url)),
        }),
      ),
  ];
}
