import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrowseTiles } from "@/components/BrowseTiles";
import { BuildEstimate } from "@/components/BuildEstimate";
import { FinderForm } from "@/components/FinderForm";
import { HouseCard } from "@/components/HouseCard";
import { ArrowRightIcon, CheckIcon, InstagramIcon, PhoneIcon, TelegramIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { SectionTitle } from "@/components/PageHeader";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatNumber, telHref } from "@/lib/format";
import { focusPosition, getHouses, getSettings, toSummary } from "@/lib/houses";
import { browsePath } from "@/lib/browse";
import { collectionHref, liveCollections } from "@/lib/collections";
import { pageMetadata, houseAlt, organizationLd, websiteLd } from "@/lib/seo";
import { AREA_REALIZED_M2, DEFAULT_INSTAGRAM_URL, FOUNDING_YEAR } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  const [t, houses] = await Promise.all([getTranslations({ locale, namespace: "meta" }), getHouses(locale)]);
  const hero = [...houses.filter((h) => h.featured), ...houses][0];
  return pageMetadata(locale, (l) => `/${l}`, t("title"), t("description"), hero?.cover, hero && houseAlt(hero, locale));
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [t, nav, meta, browse, houses, settings] = await Promise.all([
    getTranslations("home"),
    getTranslations("nav"),
    getTranslations("meta"),
    getTranslations("browse"),
    getHouses(locale),
    getSettings(locale),
  ]);
  const categories = liveCollections(houses.map(toSummary));
  const guide = t.raw("guide") as { title: string; text: string }[];

  // Featured houses first, topped up with the newest so the grid is never thin.
  const picked = [...houses.filter((h) => h.featured), ...houses.filter((h) => !h.featured)].slice(0, 6);
  const hero = picked[0];
  const floorOptions = [...new Set(houses.map((h) => h.floors))].sort((a, b) => a - b);
  const steps = t.raw("steps") as { title: string; text: string }[];

  const stats = [
    houses.length ? { value: formatNumber(houses.length), label: t("statProjects") } : null,
    { value: String(FOUNDING_YEAR), label: t("statSince") },
    { value: `~${formatNumber(AREA_REALIZED_M2)}`, label: t("statArea") },
  ].filter((s): s is { value: string; label: string } => Boolean(s));

  const container = "mx-auto max-w-[1280px] px-4 md:px-8";

  return (
    <>
      <JsonLd data={[organizationLd(settings, locale), websiteLd(locale, meta("siteName"))]} />
      <section className="relative isolate flex min-h-[520px] items-center overflow-hidden bg-ink">
        {hero && (
          <Image src={hero.cover.url} alt={houseAlt(hero, locale)} fill preload sizes="100vw"
            style={{ "--pos-small": focusPosition(hero.cover, 0.65), "--pos-wide": focusPosition(hero.cover, 2.2) } as React.CSSProperties}
            className="-z-20 object-cover [object-position:var(--pos-small)] md:[object-position:var(--pos-wide)]" />
        )}
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/80 via-black/55 to-black/25" />
        <div className={`w-full py-14 md:py-20 ${container}`}>
          {houses.length > 0 && <p className="label-caps text-gold-light">{t("eyebrow", { count: houses.length })}</p>}
          <h1 className="font-display mt-4 max-w-4xl text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.05] text-paper">{t("title")}</h1>
          <p className="mb-6 mt-3 max-w-xl text-white">{t("subtitle")}</p>
          <FinderForm floorOptions={floorOptions} />
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/loyihalar" className="rounded-full border border-white/40 bg-black/55 px-4 py-2 text-sm text-white">{t("viewCatalog")}</Link>
            {categories.slice(0, 4).map(({ collection }) => (
              <Link key={collection.id} href={collectionHref(collection, locale)} className="rounded-full border border-white/40 bg-black/55 px-4 py-2 text-sm text-white hover:bg-ink">{collection.short[locale]}</Link>
            ))}
          </div>
        </div>
      </section>

      <div className="border-b border-line bg-paper-2">
        <div className={`flex flex-wrap items-center justify-between gap-3 py-4 ${container}`}>
          <p className="text-sm text-ink-soft">{browse("consultIntro")}</p>
          <Link href={browsePath("consult")} className="font-bold text-gold">{browse("consult")} →</Link>
        </div>
      </div>

      {categories.length > 0 && (
        <section className={`pt-14 md:pt-20 ${container}`}>
          <SectionTitle eyebrow={browse("collections")} title={t("categoriesTitle")} />
          <div className="mt-6"><BrowseTiles categories={categories.slice(0, 6)} locale={locale} /></div>
          <div className="mt-4 flex flex-wrap gap-4 font-bold text-gold">
            <Link href={browsePath("styles")}>{browse("styles")} →</Link>
            <Link href={browsePath("collections")}>{browse("collections")} →</Link>
            <Link href={browsePath("size")}>{browse("size")} →</Link>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className={`mt-14 ${container}`}>
        <dl className="grid border border-line sm:grid-cols-3">
          {stats.map((s, i) => (
            <div key={s.label} className={`px-6 py-8 md:px-10 ${i > 0 ? "border-t border-line sm:border-l sm:border-t-0" : ""}`}>
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-[52px] leading-none text-ink">{s.value}</dd>
              <dd className="mt-3 text-ink-soft">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Featured */}
      {picked.length > 0 && (
        <section className={`pt-20 md:pt-28 ${container}`}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle eyebrow={nav("catalog")} title={t("featuredTitle")} />
            <Link href="/loyihalar" className="btn border border-ink text-ink hover:bg-ink hover:text-paper">
              {t("allProjects")} <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {picked.map((h) => (
              <HouseCard key={h.code} house={toSummary(h)} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-14 border-y border-line bg-paper-2 md:mt-20">
        <div className={`grid gap-6 py-14 md:grid-cols-2 ${container}`}>
          <div>
            <SectionTitle eyebrow={browse("cost")} title={browse("cost")} />
            <p className="mt-4 max-w-lg text-ink-soft">{browse("costIntro")}</p>
          </div>
          <BuildEstimate />
        </div>
      </section>

      {/* How it works */}
      <section id="jarayon" className={`pt-20 md:pt-28 ${container}`}>
        <SectionTitle eyebrow={t("howEyebrow")} title={t("howTitle")} />
        <ol className="mt-12 grid border-l border-t border-line sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="border-b border-r border-line p-7 md:p-8">
              <span className="font-display text-[56px] leading-none text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-8 text-lg font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Buying guide — genuinely useful text for people (and search engines) */}
      <section className={`pt-20 md:pt-28 ${container}`}>
        <SectionTitle eyebrow={t("guideEyebrow")} title={t("guideTitle")} />
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {guide.map((g) => (
            <article key={g.title} className="border-t-2 border-ink pt-5">
              <h3 className="font-display text-[26px] leading-tight text-ink">{g.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{g.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* What's included — editable in Studio → Site settings */}
      {settings.included.length > 0 && (
        <section className="mt-20 border-y border-line bg-paper-2 md:mt-28">
          <div className={`grid gap-12 py-16 md:py-20 lg:grid-cols-[1fr_1.4fr] ${container}`}>
            <SectionTitle eyebrow={t("includedEyebrow")} title={t("includedTitle")} />
            <ul className="grid self-end border-t border-line sm:grid-cols-2 sm:gap-x-10">
              {settings.included.map((item) => (
                <li key={item} className="flex gap-3 border-b border-line py-4 text-ink">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className={`py-14 md:py-20 ${container}`}>
        <SectionTitle eyebrow={browse("faq")} title={browse("faqIntro")} />
        <div className="mt-6 max-w-3xl space-y-3">
          {(browse.raw("faqItems") as { title: string; text: string }[]).map((item) => (
            <details key={item.title} className="rounded-lg border border-line p-4">
              <summary className="cursor-pointer font-bold">{item.title}</summary>
              <p className="mt-2 text-ink-soft">{item.text}</p>
            </details>
          ))}
        </div>
        <Link href={browsePath("faq")} className="mt-5 inline-block font-bold text-gold">{browse("faq")} →</Link>
      </section>

      {/* Custom project / contact */}
      <section id="aloqa" className={`bg-ink text-cream `}>
        <div className={`grid gap-12 py-16 md:py-24 lg:grid-cols-[1.1fr_1fr] lg:gap-20 ${container}`}>
          <div>
            <SectionTitle eyebrow={t("customEyebrow")} title={t("customTitle")} tone="dark" />
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-cream/70">{t("customText")}</p>
            <ul className="mt-10 max-w-md border-t border-line-on-ink">
              <li className="border-b border-line-on-ink">
                <a href={telHref(settings.phone)} className="flex items-center gap-4 py-4 hover:text-gold-light">
                  <PhoneIcon className="h-5 w-5 text-gold-light" /> {settings.phone}
                </a>
              </li>
              {settings.telegram && (
                <li className="border-b border-line-on-ink">
                  <a
                    href={`https://t.me/${settings.telegram}`}
                    target="_blank"
                    rel="noopener"
                    className="flex items-center gap-4 py-4 hover:text-gold-light"
                  >
                    <TelegramIcon className="h-5 w-5 text-gold-light" /> @{settings.telegram}
                  </a>
                </li>
              )}
              <li className="border-b border-line-on-ink">
                <a
                  href={settings.instagram ?? DEFAULT_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener"
                  className="flex items-center gap-4 py-4 hover:text-gold-light"
                >
                  <InstagramIcon className="h-5 w-5 text-gold-light" /> Instagram
                </a>
              </li>
            </ul>
          </div>
          <div className="self-start border border-line-on-ink bg-ink-2 p-6 sm:p-8">
            <LeadForm phone={settings.phone} tone="dark" />
          </div>
        </div>
      </section>
    </>
  );
}
