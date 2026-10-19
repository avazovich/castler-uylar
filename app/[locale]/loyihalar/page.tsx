import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { HouseCard } from "@/components/HouseCard";
import { PageHeader } from "@/components/PageHeader";
import { ArrowRightIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { getHouses, toSummary } from "@/lib/houses";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "catalog" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  return {
    title: `${t("title")} — Castler`,
    description: meta("description"),
    alternates: {
      canonical: `/${locale}/loyihalar`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/loyihalar`])),
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

  const customLink = (
    <Link href="/#aloqa" className="btn bg-ink text-paper hover:bg-gold">
      {home("customEyebrow")} <ArrowRightIcon className="h-4 w-4" />
    </Link>
  );

  return (
    <>
      <PageHeader crumbs={[{ label: nav("home"), href: "/" }, { label: t("eyebrow") }]} title={t("title")} />
      <div className="mx-auto max-w-[1280px] px-4 pb-24 pt-10 md:px-8 md:pt-12">
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
