import type { MetadataRoute } from "next";
import { articles, articlePath } from "@/content/blog";
import { routing, type Locale } from "@/i18n/routing";
import { browsePath, browseSections } from "@/lib/browse";
import { liveCollections } from "@/lib/collections";
import { getHouses, toSummary } from "@/lib/houses";
import { canonicalImageUrl } from "@/lib/imageUrl";
import { absoluteUrl, houseUrlPath } from "@/lib/seo";
import { MATERIAL_KINDS, materialPath } from "@/content/materials";
import { photosPath } from "@/content/photos";

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

  return [
    ...entries((l) => `/${l}`, { lastModified: latest }),
    ...entries((l) => `/${l}/loyihalar`, { lastModified: latest }),
    ...entries((l) => `/${l}${photosPath(l)}`, { lastModified: latest }),
    ...entries((l) => articlePath(l)),
    ...articles.flatMap(({ slugs }) => entries((l) => articlePath(l, slugs[l]))),
    ...browseSections.flatMap((section) => entries((l) => `/${l}${browsePath(section, l)}`)),
    ...MATERIAL_KINDS.flatMap((kind) => entries((l) => `/${l}${materialPath(kind, l)}`)),
    ...liveCollections(summaries).flatMap(({ collection, houses: list }) =>
      entries((l) => `/${l}/${collection.slug[l]}`, { lastModified: newest(list.map((h) => h.updatedAt)) }),
    ),
    ...houses
      .filter((h) => !h.isSample)
      .flatMap((h) =>
        entries((l) => houseUrlPath(h, l), {
          lastModified: h.updatedAt,
          // Photos and floor plans, each at its one address (the same as on the page).
          // Next writes <image:loc> as given, so the "&" between parameters must be escaped here.
          images: [h.cover, ...h.gallery, ...h.floorPlans.flatMap((f) => (f.plan ? [f.plan] : []))].map((img) =>
            canonicalImageUrl(img.url).replace(/&/g, "&amp;"),
          ),
        }),
      ),
  ];
}
