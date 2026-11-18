import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HouseCard } from "@/components/HouseCard";
import { ArrowRightIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { articles, blogPath } from "@/content/blog";
import { calcPath } from "@/lib/browse";
import { collectionFacts, collectionFaq, comparisonRows } from "@/lib/collectionPage";
import { collectionHref, findCollection, liveCollections } from "@/lib/collections";
import { formatNumber } from "@/lib/format";
import { getHouses, getSettings, toSummary } from "@/lib/houses";
import { pageMetadata, breadcrumbLd, faqLd, houseAlt, housePath, itemListLd } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
  const houses = (await getHouses(routing.defaultLocale)).map(toSummary);
  const live = liveCollections(houses);
  return routing.locales.flatMap((locale) => live.map(({ collection }) => ({ locale, collection: collection.slug[locale] })));
}

async function load(locale: Locale, slug: string) {
  const collection = findCollection(slug);
  if (!collection) return null;
  const houses = (await getHouses(locale)).map(toSummary);
  return { collection, houses: houses.filter(collection.match), all: houses };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; collection: string }>;
}): Promise<Metadata> {
  const { locale: raw, collection: slug } = await params;
  const locale = raw as Locale;
  const data = await load(locale, decodeURIComponent(slug));
  if (!data || data.houses.length === 0) return {};
  const meta = await getTranslations({ locale, namespace: "meta" });
  const c = data.collection;
  const title = c.metaTitle?.[locale] ?? meta("collectionTitle", { title: c.title[locale] });
  const from = formatNumber(Math.min(...data.houses.map((h) => h.priceUzs)));
  const description = meta("collectionDescription", { title: c.title[locale], count: data.houses.length, from });
  return pageMetadata(locale, (l) => `/${l}/${c.slug[l]}`, title, description, data.houses[0].cover);
}

export default async function CollectionPage({ params }: { params: Promise<{ locale: string; collection: string }> }) {
  const { locale: raw, collection: rawSlug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const slug = decodeURIComponent(rawSlug);

  const data = await load(locale, slug);
  // Unknown words, or a category with no houses right now → normal 404.
  if (!data || data.houses.length === 0) notFound();
  const { collection: c, houses, all } = data;
  // Arrived with the other language's slug (e.g. after switching language).
  if (slug !== c.slug[locale]) permanentRedirect(`/${locale}/${c.slug[locale]}`);

  const [t, nav, catalog, home, common, settings] = await Promise.all([
    getTranslations("collection"),
    getTranslations("nav"),
    getTranslations("catalog"),
    getTranslations("home"),
    getTranslations("common"),
    getSettings(locale),
  ]);
  const others = liveCollections(all).filter((x) => x.collection.id !== c.id);
  const path = `/${locale}/${c.slug[locale]}`;
  const n = formatNumber;
  const facts = collectionFacts(houses);
  const faq = collectionFaq(c, houses, settings, locale);
  const rows = comparisonRows(c, houses);
  const guides = (c.guides ?? []).map((g) => articles.find((a) => a.legacySlug === g)).filter((a) => a !== undefined);
  const sotix = (v: number) => `${n(v)} ${locale === "ru" ? "сот." : "sotix"}`;
  const factList = [
    { label: t("factProjects"), value: n(facts.count) },
    { label: t("factPrice"), value: t("priceFrom", { amount: n(facts.priceMin) }) },
    { label: t("factPlot"), value: facts.sotixMin === facts.sotixMax ? sotix(facts.sotixMin) : `${n(facts.sotixMin)}–${sotix(facts.sotixMax)}` },
    ...(facts.narrowest ? [{ label: t("factWidth"), value: t("width", { value: n(facts.narrowest.minPlotWidth) }) }] : []),
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: nav("home"), path: `/${locale}` },
            { name: catalog("eyebrow"), path: `/${locale}/loyihalar` },
            { name: c.title[locale], path },
          ]),
          { ...itemListLd(locale, houses), name: c.title[locale] },
          faqLd(faq),
        ]}
      />
      <PageHeader
        crumbs={[{ label: nav("home"), href: "/" }, { label: catalog("eyebrow"), href: "/loyihalar" }, { label: c.title[locale] }]}
        title={c.h1?.[locale] ?? c.title[locale]}
        subtitle={t("count", { count: houses.length })}
      />

      <div className="mx-auto max-w-[1280px] px-4 pb-24 pt-10 md:px-8 md:pt-12">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-4 rounded-xl border border-line bg-paper-2 p-5 leading-relaxed text-ink-soft md:p-7">
            {c.intro[locale].map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-xl border border-line bg-line">
            {factList.map((x) => (
              <div key={x.label} className="bg-paper p-4 md:p-5">
                <dt className="label-caps text-ink-soft">{x.label}</dt>
                <dd className="mt-1.5 text-lg font-black leading-tight tabular-nums text-ink">{x.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="stagger mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {houses.map((h, i) => (
            <HouseCard key={h.code} house={h} priority={i < 3} />
          ))}
        </div>

        <section aria-labelledby="compare" className="mt-14">
          <h2 id="compare" className="font-display text-[30px] leading-tight text-ink md:text-[34px]">{t("compareTitle")}</h2>
          {facts.narrowest && <p className="mt-2 max-w-3xl text-ink-soft">{t("compareNote")}</p>}
          <div className="mt-5 overflow-x-auto rounded-xl border border-line">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-paper-2 text-ink-soft">
                <tr>
                  <th scope="col" className="label-caps px-4 py-3 font-normal">{t("colProject")}</th>
                  <th scope="col" className="label-caps px-4 py-3 font-normal">{t("colPlot")}</th>
                  <th scope="col" className="label-caps px-4 py-3 font-normal">{t("colWidth")}</th>
                  <th scope="col" className="label-caps px-4 py-3 font-normal">{t("colFloors")}</th>
                  <th scope="col" className="label-caps px-4 py-3 text-right font-normal">{t("colPrice")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line tabular-nums">
                {rows.map((h) => (
                  <tr key={h.code} className="hover:bg-paper-2">
                    <th scope="row" className="px-4 py-3 font-normal">
                      <Link href={housePath(h, locale)} className="flex items-center gap-3 font-bold text-ink hover:text-gold">
                        <Image src={h.cover.url} alt={houseAlt(h, locale)} width={56} height={42}
                          className="h-[42px] w-14 shrink-0 rounded object-cover" style={{ objectPosition: h.cover.position }} />
                        <span>{h.name ?? common("projectNo", { code: h.code })}<span className="block text-xs font-normal text-ink-soft">№ {h.code}</span></span>
                      </Link>
                    </th>
                    <td className="px-4 py-3">{sotix(h.plotSotix)}</td>
                    <td className="px-4 py-3">{h.minPlotWidth ? t("width", { value: n(h.minPlotWidth) }) : "—"}</td>
                    <td className="px-4 py-3">{n(h.floors)}</td>
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap">{common("price", { amount: n(h.priceUzs) })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="faq" className="mt-14 rounded-xl border border-line bg-paper p-5 md:p-7">
          <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
            <h2 id="faq" className="label-caps flex items-center gap-3 self-start text-gold">
              <span className="h-px w-10 bg-current" />
              {t("faqTitle")}
            </h2>
            <div className="max-w-3xl divide-y divide-line border-y border-line">
              {faq.map((x) => (
                <details key={x.q} className="py-4">
                  <summary className="cursor-pointer font-bold">{x.q}</summary>
                  <p className="mt-2 leading-relaxed text-ink-soft">{x.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {guides.length > 0 && (
            <div className="rounded-xl border border-line bg-paper-2 p-5 md:p-7">
              <h2 className="label-caps text-ink-soft">{t("guidesTitle")}</h2>
              <ul className="mt-3 space-y-2">
                {guides.map((g) => (
                  <li key={g.legacySlug}>
                    <Link href={blogPath(g.slugs[locale])} className="font-bold text-ink underline-offset-2 hover:text-gold hover:underline">
                      {g[locale].title} →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="rounded-xl border border-line bg-paper-2 p-5 md:p-7">
            <h2 className="font-display text-[26px] leading-tight text-ink">{t("calcTitle")}</h2>
            <p className="mt-2 text-ink-soft">{t("calcText")}</p>
            <Link href={calcPath(locale)} className="btn mt-4 bg-gold text-white hover:bg-ink">
              {t("calcCta")} <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-10">
          <Link href="/loyihalar" className="btn border border-ink text-ink hover:bg-ink hover:text-paper">
            {t("allProjects")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {others.length > 0 && (
          <nav aria-label={t("otherTitle")} className="mt-16 border-t border-line pt-10">
            <h2 className="font-display text-[34px] leading-tight text-ink">{t("otherTitle")}</h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {others.map(({ collection: o, houses: list }) => (
                <li key={o.id}>
                  <Link href={collectionHref(o, locale)} className="block rounded-full border border-line px-4 py-2.5 text-ink hover:border-ink">
                    {o.title[locale]} <span className="text-ink-soft">· {list.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-16 rounded-xl border border-line bg-paper-2 p-6 md:p-10">
          <p className="font-display text-[30px] leading-tight text-ink">{home("customTitle")}</p>
          <p className="mt-3 max-w-2xl text-ink-soft">{home("customText")}</p>
          <Link href="/#aloqa" className="btn mt-6 bg-ink text-paper hover:bg-gold">
            {home("customEyebrow")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
