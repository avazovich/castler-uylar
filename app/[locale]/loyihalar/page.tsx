import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";
import { HouseCard } from "@/components/HouseCard";
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

  const [t, home, houses] = await Promise.all([
    getTranslations("catalog"),
    getTranslations("home"),
    getHouses(locale),
  ]);
  const summaries = houses.map(toSummary);

  const customLink = (
    <Link href="/#aloqa" className="pill bg-ink text-paper hover:bg-ink-2">
      {home("customEyebrow")} <ArrowRightIcon className="h-4 w-4" />
    </Link>
  );

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-24 pt-10 md:px-8 md:pt-14">
      <p className="label-mono text-gold">{t("eyebrow")}</p>
      <h1 className="font-display mt-3 text-[42px] leading-[1.05] text-ink md:text-7xl">{t("title")}</h1>

      {/* The filters read the URL, which isn't known while the page is
          pre-built — until the browser takes over, show the full list so
          the page is never empty (and search engines see every house). */}
      <Suspense
        fallback={
          <div className="mt-[136px] grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {summaries.map((h) => (
              <HouseCard key={h.code} house={h} />
            ))}
          </div>
        }
      >
        <Catalog houses={summaries} emptyAction={customLink} />
      </Suspense>
    </div>
  );
}
