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
import { getHouses, toSummary } from "@/lib/houses";
import { pageMetadata, breadcrumbLd, itemListLd } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const [meta, houses] = await Promise.all([getTranslations({ locale, namespace: "meta" }), getHouses(locale)]);
  const title = meta("catalogTitle", { count: houses.length });
  const description = meta("catalogDescription");
  const cover = [...houses.filter((h) => h.featured), ...houses][0]?.cover;
  return pageMetadata(locale, (l) => `/${l}/loyihalar`, title, description, cover);
}

export default async function CatalogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [t, home, nav, browse, houses] = await Promise.all([
    getTranslations("catalog"),
    getTranslations("home"),
    getTranslations("nav"),
    getTranslations("browse"),
    getHouses(locale),
  ]);
  const summaries = houses.map(toSummary);

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
      <div className="catalog-heading">
        <PageHeader crumbs={[{ label: nav("home"), href: "/" }, { label: t("eyebrow") }]} />
        <section className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-11">
          <p className="label-caps text-gold">{t("eyebrow")}</p>
          <h1 className="mt-2 text-[clamp(2rem,4vw,2.65rem)] leading-tight font-black">{t("title")}</h1>
          <p className="mt-2 text-sm text-ink-soft">{browse("catalogIntro")} <Link className="font-bold text-ink underline underline-offset-2" href="/browse/collections">{browse("collections")} →</Link></p>
          <p className="mt-2 text-sm"><Link className="font-bold underline underline-offset-2" href="/#finder">{browse("describeMode")} →</Link></p>
        </section>
      </div>
      <div className="bg-paper-2"><div className="mx-auto max-w-[1280px] px-4 pb-20 pt-4 md:px-8">
        {/* The filters read the URL, which isn't known while the page is
            pre-built — until the browser takes over, show the full list so
            the page is never empty (and search engines see every house). */}
        <Suspense
          fallback={
            <div className="grid gap-6">
              <div className="hidden h-40 rounded-xl border border-line bg-paper-2 lg:block" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {summaries.map((h) => (
                  <HouseCard key={h.code} house={h} />
                ))}
              </div>
            </div>
          }
        >
          <Catalog houses={summaries} emptyAction={customLink} />
        </Suspense>
      </div></div>
    </>
  );
}
