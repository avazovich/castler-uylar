import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { routing, type Locale } from "@/i18n/routing";
import { calcPath } from "@/lib/browse";
import { computeCost, DEFAULT_INPUT, type CostInput, type Finish } from "@/lib/buildCost/engine";
import { PRICES_AS_OF } from "@/lib/buildCost/prices";
import { getUsdRate } from "@/lib/buildCost/usdRate";
import { formatNumber } from "@/lib/format";
import { getHouses, getSettings } from "@/lib/houses";
import { absoluteUrl, breadcrumbLd, faqLd, housePath, pageMetadata } from "@/lib/seo";
import { MAIN_SITE_URL } from "@/lib/site";
import { CostCalculator, CostCalculatorFromUrl, type PlanCard, type StyleImages } from "./CostCalculator";
import { JsonLd } from "./JsonLd";
import { PageHeader } from "./PageHeader";

/**
 * The build-cost calculator page, at /uz/uy-qurish-narxi-kalkulyatori and
 * /ru/kalkulyator-stroitelstva-doma. Under the quiz (which search engines see
 * only as its first question) sits plain text they can read: a price table and
 * answers to the questions people actually search — every number worked out
 * by the same engine as the calculator, so the page never contradicts itself.
 */

/** The reference house for the table and answers: brick, pitched roof, modern, no extras. */
const REFERENCE: CostInput = { ...DEFAULT_INPUT, style: "modern", walls: "brick", roof: "pitched", basement: false, fence: false, paving: false };
const ROWS = [{ area: 100, floors: 1 }, { area: 150, floors: 2 }, { area: 200, floors: 2 }, { area: 300, floors: 2 }] as const;
const LEVELS: Finish[] = ["shell", "rough", "turnkey"];

export async function calculatorMetadata(locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "calcSeo" });
  return pageMetadata(locale, (l) => `/${l}${calcPath(l)}`, t("title"), t("description"));
}

export async function CalculatorPage({ locale: raw, slugLocale }: { locale: string; slugLocale: Locale }) {
  if (!hasLocale(routing.locales, raw)) notFound();
  const locale: Locale = raw;
  // /ru/<Uzbek slug> or /uz/<Russian slug> (the language switch keeps the path) → the right one.
  if (locale !== slugLocale) permanentRedirect(`/${locale}${calcPath(locale)}`);
  setRequestLocale(locale);

  const [t, calc, nav, browse, houses, settings, usd] = await Promise.all([
    getTranslations("calcSeo"), getTranslations("calc"), getTranslations("nav"), getTranslations("browse"),
    getHouses(locale), getSettings(locale), getUsdRate(),
  ]);

  // Real catalog houses (never the "Namuna" samples), for "best fit for your land".
  const plans: PlanCard[] = houses.filter((house) => !house.isSample).map((house) => ({
    code: house.code, name: house.name, href: housePath(house, locale), totalArea: house.totalArea, floors: house.floors,
    style: house.style, priceUzs: house.priceUzs, plotSotix: house.plotSotix,
    cover: { url: house.cover.url, position: house.cover.position, lqip: house.cover.lqip },
  }));
  // A real Castler house for each style, shown on the style question.
  const images: StyleImages = Object.fromEntries((["modern", "neoclassic", "classic"] as const).flatMap((style) => {
    const house = houses.find((item) => item.style === style && !item.isSample) ?? houses.find((item) => item.style === style);
    return house ? [[style, { url: house.cover.url, position: house.cover.position, lqip: house.cover.lqip }]] : [];
  }));

  // ── Numbers for the text, from the calculator's own engine ──
  const som = locale === "uz" ? "so‘m" : "сум";
  const mln = locale === "uz" ? "mln" : "млн";
  const total = (uzs: number) => `${formatNumber(Math.round(uzs / 1e6))} ${mln} ${som}`;
  const perM2 = (uzs: number) => `${formatNumber(Math.round(uzs / 1e5) / 10)} ${mln} ${som}`;
  const dollars = (uzs: number) => `$${formatNumber(Math.round(uzs / usd.rate))}`;
  const table = ROWS.map((row) => ({
    ...row,
    cells: LEVELS.map((finish) => computeCost({ ...REFERENCE, area: row.area, floors: row.floors, finish })),
  }));
  const typical = table[1]; // 150 m², 2 floors
  const [shell, rough, turnkey] = typical.cells;
  const gasblockTurnkey = computeCost({ ...REFERENCE, area: 150, floors: 2, finish: "turnkey", walls: "gasblock" });
  const faq = [
    { q: t("faq.q1"), a: t("faq.a1", { shell: total(shell.totalUzs), rough: total(rough.totalUzs), turnkey: total(turnkey.totalUzs), usd: dollars(turnkey.totalUzs) }) },
    { q: t("faq.q2"), a: t("faq.a2", { shell: perM2(shell.perM2Uzs), turnkey: perM2(turnkey.perM2Uzs), shellUsd: dollars(shell.perM2Uzs), turnkeyUsd: dollars(turnkey.perM2Uzs) }) },
    { q: t("faq.q3"), a: t("faq.a3", { diff: total(turnkey.totalUzs - gasblockTurnkey.totalUzs) }) },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5", { date: PRICES_AS_OF[locale] }) },
  ];

  const path = `/${locale}${calcPath(locale)}`;
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t("h1"),
    description: t("description"),
    url: absoluteUrl(path),
    inLanguage: locale,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: 0, priceCurrency: "UZS" },
    areaServed: { "@type": "Country", name: locale === "uz" ? "O‘zbekiston" : "Узбекистан" },
    provider: { "@type": "Organization", name: "Castler", url: MAIN_SITE_URL },
  };

  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: nav("home"), path: `/${locale}` }, { name: t("h1"), path }]), app, faqLd(faq)]} />
      <PageHeader title={t("h1")} subtitle={browse("costIntro")} crumbs={[{ label: nav("home"), href: "/" }, { label: browse("cost") }]} />

      <section className="mx-auto max-w-[1280px] px-4 py-12 md:px-8">
        <Suspense fallback={<CostCalculator usd={usd} images={images} plans={plans} phone={settings.phone} />}>
          <CostCalculatorFromUrl usd={usd} images={images} plans={plans} phone={settings.phone} />
        </Suspense>
      </section>

      <section className="border-t border-line bg-cream/60">
        <div className="mx-auto grid max-w-[920px] gap-12 px-4 py-14 md:px-8 md:py-20">
          <div>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-ink">{t("tableTitle")}</h2>
            <p className="mt-3 max-w-2xl text-ink-soft">{t("tableIntro")}</p>
            <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-paper">
              <table className="w-full min-w-[560px] text-left text-[15px]">
                <caption className="sr-only">{t("tableTitle")}</caption>
                <thead className="border-b border-line bg-cream/70 text-[13px] uppercase tracking-wider text-ink-soft">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">{t("tableHouse")}</th>
                    {LEVELS.map((level) => <th key={level} scope="col" className="px-4 py-3 text-right font-semibold">{calc(level)}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {table.map((row) => (
                    <tr key={row.area} className="border-b border-line last:border-b-0">
                      <th scope="row" className="px-4 py-3 font-semibold text-ink">{t("tableRow", { area: row.area, floors: row.floors })}</th>
                      {row.cells.map((cell, i) => (
                        <td key={LEVELS[i]} className="px-4 py-3 text-right tabular-nums">
                          <span className="block font-semibold text-ink">{total(cell.totalUzs)}</span>
                          <span className="block text-[13px] text-ink-soft">≈ {dollars(cell.totalUzs)} · {perM2(cell.perM2Uzs)}/m²</span>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] text-ink-soft">{t("tableNote", { date: PRICES_AS_OF[locale], rate: formatNumber(usd.rate) })}</p>
          </div>

          <div>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-ink">{t("faqTitle")}</h2>
            <div className="mt-6 grid gap-3">
              {faq.map((item) => (
                <details key={item.q} className="rounded-xl border border-line bg-paper px-5 py-4">
                  <summary className="cursor-pointer font-semibold text-ink">{item.q}</summary>
                  <p className="mt-3 leading-relaxed text-ink-soft">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
