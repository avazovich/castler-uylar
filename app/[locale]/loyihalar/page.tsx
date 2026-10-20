import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { HouseCard } from "@/components/HouseCard";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { ArrowRightIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { collectionHref, liveCollections } from "@/lib/collections";
import { getHouses, toSummary } from "@/lib/houses";
import { alternates, breadcrumbLd, itemListLd, socialImage } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const [meta, houses] = await Promise.all([getTranslations({ locale, namespace: "meta" }), getHouses(locale)]);
  const title = meta("catalogTitle", { count: houses.length });
  const description = meta("catalogDescription");
  const cover = [...houses.filter((h) => h.featured), ...houses][0]?.cover;
  return {
    title,
    description,
    alternates: alternates(locale, (l) => `/${l}/loyihalar`),
    openGraph: {
      title,
      description,
      url: `/${locale}/loyihalar`,
      ...(cover ? { images: [{ url: socialImage(cover), width: 1200, height: 630 }] } : {}),
    },
  };
}

export default async function CatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [t, home, nav, houses] = await Promise.all([
    getTranslations("catalog"),
    getTranslations("home"),
    getTranslations("nav"),
    getHouses(locale),
  ]);
  const summaries = houses.map(toSummary);
  const categories = liveCollections(summaries);

  const customLink = (
    <Link href="/#aloqa" className="btn bg-ink text-paper hover:bg-gold">
      {home("customEyebrow")} <ArrowRightIcon className="h-4 w-4" />
    </Link>
  );

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: nav("home"), path: `/${locale}` },
            { name: t("eyebrow"), path: `/${locale}/loyihalar` },
          ]),
          itemListLd(locale, summaries),
        ]}
      />
      <PageHeader crumbs={[{ label: nav("home"), href: "/" }, { label: t("eyebrow") }]} title={t("title")} />
      <div className="mx-auto max-w-[1280px] px-4 pb-24 pt-10 md:px-8 md:pt-12">
        {categories.length > 0 && (
          <nav aria-label={t("categories")} className="mb-10 flex flex-wrap items-center gap-2">
            <span className="label-caps mr-2 text-ink-soft">{t("categories")}</span>
            {categories.map(({ collection: c, houses: list }) => (
              <Link
                key={c.id}
                href={collectionHref(c, locale)}
                className="border border-line px-3 py-2 text-sm text-ink transition-colors hover:border-ink"
              >
                {c.short[locale]} <span className="text-ink-soft">· {list.length}</span>
              </Link>
            ))}
          </nav>
        )}
        {/* The filters read the URL, which isn't known while the page is
            pre-built — until the browser takes over, show the full list so
            the page is never empty (and search engines see every house). */}
        <Suspense
          fallback={
            <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
              <div className="hidden h-[520px] border border-line bg-paper-2 lg:block" />
              <div className="grid gap-6 pt-[61px] sm:grid-cols-2">
                {summaries.map((h) => (
                  <HouseCard key={h.code} house={h} />
                ))}
              </div>
            </div>
          }
        >
          <Catalog houses={summaries} emptyAction={customLink} />
        </Suspense>
      </div>
    </>
  );
}
