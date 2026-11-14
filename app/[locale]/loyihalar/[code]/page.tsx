import type { Metadata } from "next";
import { FloorPlans } from "@/components/FloorPlans";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Gallery } from "@/components/Gallery";
import { HouseCard } from "@/components/HouseCard";
import { CheckIcon, PhoneIcon, TelegramIcon } from "@/components/icons";
import { LeadDialog } from "@/components/LeadDialog";
import { BuildEstimate } from "@/components/BuildEstimate";
import { PlotCheck } from "@/components/PlotCheck";
import { Link } from "@/i18n/navigation";
import { browsePath } from "@/lib/browse";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { routing, type Locale } from "@/i18n/routing";
import { formatNumber, formatUsd, telHref } from "@/lib/format";
import { getHouse, getHouses, getSettings, toSummary, type House } from "@/lib/houses";
import { pageMetadata, breadcrumbLd, faqLd, houseAlt, houseDescription, houseFaq, houseKind, houseSlug, houseSummary, houseTitle, houseUrlPath, productLd } from "@/lib/seo";
import { STYLES } from "@/lib/vocab";

export const revalidate = 60;

/** "104" or "104-uychi-2-qavatli-…" → 104. Old number-only links still work: the page redirects them to the full address. */
function parseCode(raw: string): number | undefined {
  const m = /^(\d{1,6})(?:-[a-z0-9-]*)?$/.exec(decodeURIComponent(raw));
  return m ? Number(m[1]) : undefined;
}

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  const locale = (routing.locales as readonly string[]).includes(params.locale) ? (params.locale as Locale) : routing.defaultLocale;
  const houses = await getHouses(locale);
  return houses.map((h) => ({ code: houseSlug(h, locale) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}): Promise<Metadata> {
  const { locale: raw, code } = await params;
  const locale = raw as Locale;
  const n = parseCode(code);
  const house = n ? await getHouse(n, locale) : undefined;
  if (!house) return {};
  const summary = toSummary(house);
  const title = `${houseTitle(summary, locale)} | Castler`;
  const description = houseDescription(summary, locale);
  return {
    ...pageMetadata(locale, (l) => houseUrlPath(house, l), title, description, house.cover, houseAlt(house, locale)),
    ...(house.isSample ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Same floors first, then closest in size. */
function similarTo(house: House, all: House[]): House[] {
  return all
    .filter((h) => h.code !== house.code)
    .sort(
      (a, b) =>
        Number(b.floors === house.floors) - Number(a.floors === house.floors) ||
        Math.abs(a.totalArea - house.totalArea) - Math.abs(b.totalArea - house.totalArea),
    )
    .slice(0, 3);
}

export default async function HousePage({ params }: { params: Promise<{ locale: string; code: string }> }) {
  const { locale: raw, code } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const n = parseCode(code);
  const house = n ? await getHouse(n, locale) : undefined;
  if (!house) notFound();
  if (decodeURIComponent(code) !== houseSlug(house, locale)) permanentRedirect(houseUrlPath(house, locale));

  const [t, common, home, nav, browse, settings, all] = await Promise.all([
    getTranslations("house"),
    getTranslations("common"),
    getTranslations("home"),
    getTranslations("nav"),
    getTranslations("browse"),
    getSettings(locale),
    getHouses(locale),
  ]);
  const fmt = formatNumber;
  const title = house.name ?? common("projectNo", { code: house.code });
  const summary = toSummary(house);
  const images = [house.cover, ...house.gallery];
  const alts = images.map((_, i) => houseAlt(house, locale, i + 1));
  const kind = `${house.style ? `${STYLES[house.style][locale]} · ` : ""}${t("kindLine", { kind: houseKind(house.floors, locale, "gen") })}`;
  const similar = similarTo(house, all);
  const roomsTotal = Math.round(house.floorPlans.reduce((s, f) => s + f.total, 0) * 10) / 10;
  const costTotal = house.buildEstimate.reduce((s, c) => s + c.costUsd, 0);
  const faq = houseFaq(house, settings, locale);

  const specs = [
    { label: t("specPlot"), value: t("sotix", { value: fmt(house.plotSotix) }) },
    { label: t("specArea"), value: t("m2", { value: fmt(house.totalArea) }) },
    { label: t("specFloors"), value: fmt(house.floors) },
    house.bedrooms ? { label: t("specBedrooms"), value: fmt(house.bedrooms) } : null,
    house.bathrooms ? { label: t("specBathrooms"), value: fmt(house.bathrooms) } : null,
    house.minPlotWidth
      ? {
          label: t("specPlotSize"),
          value: house.minPlotLength
            ? `${fmt(house.minPlotWidth)} × ${t("m", { value: fmt(house.minPlotLength) })}`
            : t("m", { value: fmt(house.minPlotWidth) }),
        }
      : null,
  ].filter((s): s is { label: string; value: string } => Boolean(s));

  const container = "mx-auto max-w-[1280px] px-4 md:px-8";

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: nav("home"), path: `/${locale}` },
            { name: nav("catalog"), path: `/${locale}/loyihalar` },
            { name: houseTitle(summary, locale), path: houseUrlPath(house, locale) },
          ]),
          faqLd(faq),
          // No product data for sample houses: their prices aren't real.
          ...(house.isSample ? [] : [productLd(summary, locale, images, house.description ?? houseDescription(summary, locale))]),
        ]}
      />
      <PageHeader
        crumbs={[
          { label: nav("home"), href: "/" },
          { label: nav("catalog"), href: "/loyihalar" },
          { label: `№ ${house.code}${house.name ? ` · ${house.name}` : ""}` },
        ]}
      />

      <div className="plan-page bg-paper-2">
        <div className={`pb-24 pt-6 md:pt-7 ${container}`}>
          <div id="overview" className="grid items-start gap-6 lg:grid-cols-[minmax(0,2.08fr)_minmax(0,1fr)] lg:gap-10">
            <div className="relative min-w-0">
              <Gallery images={images} title={title} alts={alts} />
              {house.featured && <span className="pointer-events-none absolute left-3 top-3 rounded-sm bg-gold px-2 py-1 text-xs font-bold text-white">★ {browse("featuredPlan")}</span>}
              {house.floorPlans.length > 0 && <a href="#floor-plans" className="btn mt-3 border border-line bg-paper hover:border-gold">{browse("photoShortcut")} ↓</a>}
            </div>

            <aside className="min-w-0">
              {house.featured && <p className="label-caps mb-2 text-gold">★ {browse("featuredPlan")}</p>}
              <h1 className="font-display text-[clamp(1.65rem,2.25vw,2.1rem)] leading-[1.1]">{houseTitle(summary, locale)}</h1>
              <p className="my-3 text-xs text-ink-soft">№ {house.code} · {kind} · {fmt(house.totalArea)} m²</p>
              <div className="mb-5 flex flex-wrap gap-1.5">
                {specs.slice(0, 5).map(({ label, value }) => <span key={label} className="rounded-sm border border-line bg-[#e9e4d9] px-2 py-1 text-xs font-bold">{label} · {value}</span>)}
              </div>
              {house.isSample && <p className="mb-3 rounded-md border border-gold/30 bg-gold/10 p-3 text-sm">{t("sampleNotice")}</p>}
              <div className="space-y-3.5 border-t border-dashed border-line pt-3.5">
                <a href="#build-cost" className="block rounded-sm border border-[#d5cfc2] bg-[#e5e1d7] p-3.5 hover:border-gold">
                  <span className="label-caps block text-ink-soft">{browse("cost")}</span>
                  <span className="flex justify-between gap-2"><span className="font-display text-lg">{costTotal > 0 ? formatUsd(costTotal) : browse("calculate")}</span><span aria-hidden="true">↓</span></span>
                </a>
                {house.minPlotWidth && house.minPlotLength ? (
                  <PlotCheck width={house.minPlotWidth} length={house.minPlotLength} area={house.plotSotix * 100} />
                ) : house.minPlotWidth ? (
                  <a href="#full-specs" className="block rounded-md border border-line bg-[#e9e4d9] p-3.5 font-display text-lg hover:border-gold">{browse("plotCheck")} ↓</a>
                ) : null}
                <div id="project-package" className="rounded-lg border border-line bg-paper p-4 md:p-5">
                  <p className="label-caps text-gold">{browse("planPrice")}</p>
                  {settings.included.length > 0 && <details className="mt-3 rounded-md border border-gold/40 bg-paper-2 p-3">
                    <summary className="cursor-pointer text-sm font-bold">{home("includedTitle")}</summary>
                    <ul className="mt-2 space-y-1 text-sm text-ink-soft">{settings.included.map((item) => <li key={item}>✓ {item}</li>)}</ul>
                  </details>}
                  <div className="mt-2 flex flex-wrap items-baseline gap-x-3">
                    <p className="font-display text-3xl">{common("price", { amount: fmt(house.priceUzs) })}</p>
                    {house.oldPriceUzs && <p className="text-sm text-ink-soft line-through">{common("price", { amount: fmt(house.oldPriceUzs) })}</p>}
                  </div>
                  <p className="mt-1 text-sm text-ink-soft">{t("priceNote")}</p>
                  <LeadDialog houseCode={house.code} houseTitle={title} phone={settings.phone} className="btn mt-4 w-full bg-gold text-paper hover:bg-ink">{t("discuss")}</LeadDialog>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <a href={telHref(settings.phone)} className="btn flex-1 border border-line px-3"><PhoneIcon className="h-4 w-4" /> {t("call")}</a>
                    {settings.telegram && <a href={`https://t.me/${settings.telegram}`} className="btn flex-1 border border-line px-3"><TelegramIcon className="h-4 w-4" /> Telegram</a>}
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <nav aria-label={browse("overview")} className="plan-toolbar sticky top-0 z-20 mt-5 flex flex-wrap items-center gap-1 rounded-lg border border-line bg-paper p-1 shadow-sm">
            {[
              { href: "overview", label: browse("overview") },
              ...(house.floorPlans.length > 0 ? [{ href: "floor-plans", label: t("plansTitle") }] : []),
              { href: "full-specs", label: browse("specifications") },
              { href: "modifications", label: browse("adapt") },
              { href: "build-cost", label: browse("cost") },
              { href: "project-faq", label: browse("faq") },
            ].map(({ href, label }) => <a key={href} href={`#${href}`} className="rounded-md px-2.5 py-2 text-xs font-bold hover:bg-paper-2 sm:text-sm">{label}</a>)}
            <a href="#project-package" className="ml-auto rounded-md bg-gold px-3 py-2 text-xs font-bold text-white sm:text-sm">{t("discuss")}</a>
          </nav>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
            {specs.map(({ label, value }) => <div key={label} className="bg-paper p-3 text-center">
              <dt className="text-xs font-bold text-ink-soft">{label}</dt><dd className="font-display text-xl md:text-2xl">{value}</dd>
            </div>)}
          </dl>

          <section className="mt-10 rounded-lg border border-line bg-paper p-5 md:p-7">
            <SectionTitle title={t("about")} />
            <div className="mt-4 max-w-3xl space-y-3 leading-relaxed">
              {house.description && <p className="whitespace-pre-line">{house.description}</p>}
              <p className="text-ink-soft">{houseSummary(summary, locale)}</p>
            </div>
          </section>

          {house.floorPlans.length > 0 && (
            <section id="floor-plans" className="mt-12 rounded-lg border border-line bg-paper p-5 md:p-7">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionTitle title={t("plansTitle")} />
                {roomsTotal > 0 && <p className="text-ink-soft">{t("plansTotal", { value: fmt(roomsTotal) })}</p>}
              </div>
              <FloorPlans floors={house.floorPlans} />
            </section>
          )}

          <section id="full-specs" className="mt-12 rounded-lg border border-line bg-paper p-5 md:p-7">
            <SectionTitle title={browse("specifications")} />
            <dl className="mt-5 grid gap-x-8 md:grid-cols-2">
              {specs.map(({ label, value }) => <div key={label} className="flex justify-between gap-4 border-b border-line py-3"><dt>{label}</dt><dd className="text-right font-bold">{value}</dd></div>)}
            </dl>
          </section>

          <section id="modifications" className="mt-12 rounded-lg border border-line bg-[#e9e4d9] p-5 md:p-7">
            <SectionTitle title={browse("adapt")} />
            <p className="my-4 max-w-2xl text-ink-soft">{browse("adaptText")}</p>
            <Link href={browsePath("consult")} className="btn bg-gold text-paper">{browse("consult")} →</Link>
          </section>

          {house.buildEstimate.length > 0 ? (
            <section id="build-cost" className="mt-12 rounded-lg border border-line bg-paper p-5 md:p-7">
              <SectionTitle title={t("costTitle")} />
              <p className="mt-3 text-ink-soft">{t("costSubtitle")}</p>
              <div className="mt-10 overflow-x-auto border border-line">
                <table className="w-full min-w-[420px] text-left text-[15px]">
                  <thead className="border-b border-line bg-paper-2">
                    <tr>
                      <th className="label-caps px-5 py-3.5 text-ink-soft">{t("costPart")}</th>
                      <th className="label-caps px-5 py-3.5 text-right text-ink-soft">{t("costArea")}</th>
                      <th className="label-caps px-5 py-3.5 text-right text-ink-soft">{t("costSum")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {house.buildEstimate.map((c, i) => (
                      <tr key={i} className="border-b border-line">
                        <td className="px-5 py-3.5 text-ink">{c.label}</td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-ink-soft">
                          {c.area ? t("m2", { value: fmt(c.area) }) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-ink">{formatUsd(c.costUsd)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-ink font-semibold text-paper">
                      <td className="px-5 py-4">{t("costTotal")}</td>
                      <td />
                      <td className="px-5 py-4 text-right tabular-nums">{formatUsd(costTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              <p className="mt-3 text-sm text-ink-soft">{t("costNote")}</p>
            </section>
          ) : (
            <section id="build-cost" className="mt-12 rounded-lg border border-line bg-paper p-5 md:p-7">
              <SectionTitle title={browse("cost")} />
              <div className="mt-4"><BuildEstimate /></div>
            </section>
          )}

          {settings.included.length > 0 && (
            <section id="included" className="mt-12 rounded-lg border border-line bg-paper p-5 md:p-7">
              <SectionTitle eyebrow={home("includedEyebrow")} title={home("includedTitle")} />
              <ul className="mt-8 grid border-t border-line sm:grid-cols-2 sm:gap-x-10">
                {settings.included.map((item) => (
                  <li key={item} className="flex gap-3 border-b border-line py-3.5 text-ink">
                    <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section id="project-faq" className="mt-12 rounded-lg border border-line bg-paper p-5 md:p-7">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <h2 className="label-caps flex items-center gap-3 text-gold">
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

          {similar.length > 0 && (
            <section className="mt-16 border-t border-line pt-12 md:mt-20">
              <SectionTitle title={t("similar")} />
              <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {similar.map((h) => (
                  <HouseCard key={h.code} house={toSummary(h)} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
