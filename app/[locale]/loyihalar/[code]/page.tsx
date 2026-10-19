import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Gallery } from "@/components/Gallery";
import { HouseCard } from "@/components/HouseCard";
import { CheckIcon, PhoneIcon, TelegramIcon } from "@/components/icons";
import { LeadDialog } from "@/components/LeadDialog";
import { PageHeader, SectionTitle } from "@/components/PageHeader";
import { routing, type Locale } from "@/i18n/routing";
import { formatNumber, formatUsd, telHref } from "@/lib/format";
import { getHouse, getHouses, getSettings, toSummary, type House } from "@/lib/houses";
import { STYLES } from "@/lib/vocab";

export const revalidate = 60;

function parseCode(raw: string): number | undefined {
  return /^\d{1,6}$/.test(raw) ? Number(raw) : undefined;
}

export async function generateStaticParams() {
  const houses = await getHouses(routing.defaultLocale);
  return houses.map((h) => ({ code: String(h.code) }));
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
  const [t, common] = await Promise.all([
    getTranslations({ locale, namespace: "meta" }),
    getTranslations({ locale, namespace: "common" }),
  ]);
  const name = house.name ?? common("projectNo", { code: house.code });
  return {
    title: t("houseTitle", { name }),
    description: t("houseDescription", {
      area: formatNumber(house.totalArea),
      floors: common("floors", { count: house.floors, label: formatNumber(house.floors) }),
      plot: formatNumber(house.plotSotix),
      price: common("price", { amount: formatNumber(house.priceUzs) }),
    }),
    alternates: {
      canonical: `/${locale}/loyihalar/${house.code}`,
      languages: Object.fromEntries(routing.locales.map((l) => [l, `/${l}/loyihalar/${house.code}`])),
    },
    openGraph: { images: [{ url: `${house.cover.url}?w=1200&h=630&fit=crop&auto=format` }] },
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

  const [t, common, home, nav, settings, all] = await Promise.all([
    getTranslations("house"),
    getTranslations("common"),
    getTranslations("home"),
    getTranslations("nav"),
    getSettings(locale),
    getHouses(locale),
  ]);
  const fmt = formatNumber;
  const title = house.name ?? common("projectNo", { code: house.code });
  const images = [house.cover, ...house.gallery];
  const similar = similarTo(house, all);
  const roomsTotal = Math.round(house.floorPlans.reduce((s, f) => s + f.total, 0) * 10) / 10;
  const costTotal = house.buildEstimate.reduce((s, c) => s + c.costUsd, 0);

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
      <PageHeader
        crumbs={[
          { label: nav("home"), href: "/" },
          { label: nav("catalog"), href: "/loyihalar" },
          { label: `№ ${house.code}${house.name ? ` · ${house.name}` : ""}` },
        ]}
      />

      <div className={`pb-24 pt-8 md:pt-10 ${container}`}>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
          <Gallery images={images} title={title} />

          <aside className="self-start border border-line lg:sticky lg:top-28">
            {house.isSample && (
              <p className="border-b border-gold/40 bg-gold/10 px-6 py-3 text-sm text-ink">
                <span className="label-caps mr-2 text-gold">{common("sample")}</span>
                {t("sampleNotice")}
              </p>
            )}
            <div className="p-6 md:p-7">
              <p className="label-caps text-ink-soft">
                № {house.code}
                {house.style ? ` · ${STYLES[house.style][locale]}` : ""}
              </p>
              <h1 className="font-display mt-2 text-[46px] leading-[1.02] text-ink md:text-[54px]">{title}</h1>

              <div className="mt-6 border-t border-line pt-5">
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <p className="text-[30px] font-semibold text-ink">{common("price", { amount: fmt(house.priceUzs) })}</p>
                  {house.oldPriceUzs && (
                    <p className="text-lg text-ink-soft line-through">{common("price", { amount: fmt(house.oldPriceUzs) })}</p>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-soft">{t("priceNote")}</p>
              </div>

              <table className="mt-6 w-full border-t border-line text-[15px]">
                <tbody>
                  {specs.map((s) => (
                    <tr key={s.label} className="border-b border-line">
                      <th scope="row" className="py-3 pr-4 text-left font-normal text-ink-soft">
                        {s.label}
                      </th>
                      <td className="py-3 text-right font-semibold text-ink">{s.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <LeadDialog
                houseCode={house.code}
                houseTitle={`№ ${house.code}${house.name ? ` «${house.name}»` : ""}`}
                phone={settings.phone}
                className="btn mt-7 w-full bg-ink py-[18px] text-paper hover:bg-gold"
              >
                {t("discuss")}
              </LeadDialog>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {settings.telegram && (
                  <a
                    href={`https://t.me/${settings.telegram}`}
                    target="_blank"
                    rel="noopener"
                    className="btn border border-line px-3 text-ink hover:border-ink"
                  >
                    <TelegramIcon className="h-4 w-4" /> Telegram
                  </a>
                )}
                <a
                  href={telHref(settings.phone)}
                  className={`btn border border-line px-3 text-ink hover:border-ink ${settings.telegram ? "" : "col-span-2"}`}
                >
                  <PhoneIcon className="h-4 w-4" /> {t("call")}
                </a>
              </div>
            </div>
          </aside>
        </div>

        {house.description && (
          <section className="mt-16 border-t border-line pt-12 md:mt-20">
            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
              <h2 className="label-caps flex items-center gap-3 text-gold">
                <span className="h-px w-10 bg-current" />
                {t("about")}
              </h2>
              <p className="max-w-3xl whitespace-pre-line text-lg leading-relaxed text-ink">{house.description}</p>
            </div>
          </section>
        )}

        {house.floorPlans.length > 0 && (
          <section className="mt-16 border-t border-line pt-12 md:mt-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionTitle title={t("plansTitle")} />
              {roomsTotal > 0 && <p className="text-ink-soft">{t("plansTotal", { value: fmt(roomsTotal) })}</p>}
            </div>
            <div className={`mt-10 grid gap-6 ${house.floorPlans.length > 1 ? "md:grid-cols-2" : "max-w-3xl"}`}>
              {house.floorPlans.map((floor, i) => (
                <article key={`${floor.level}-${i}`} className="self-start border border-line">
                  <header className="flex items-baseline justify-between gap-3 border-b border-line bg-paper-2 px-5 py-4">
                    <h3 className="font-display text-[26px] leading-none text-ink">{floor.label}</h3>
                    {floor.total > 0 && (
                      <p className="text-sm font-semibold tabular-nums text-ink">{t("m2", { value: fmt(floor.total) })}</p>
                    )}
                  </header>
                  {floor.plan && (
                    <div className="relative aspect-[4/3] border-b border-line bg-paper">
                      <Image
                        src={floor.plan.url}
                        alt={t("planAlt", { level: floor.label })}
                        fill
                        sizes="(min-width: 768px) 45vw, 100vw"
                        className="object-contain p-4"
                      />
                    </div>
                  )}
                  {floor.rooms.length > 0 && (
                    <table className="w-full text-[15px]">
                      <tbody>
                        {floor.rooms.map((room, j) => (
                          <tr key={j} className="border-b border-line last:border-b-0">
                            <td className="px-5 py-2.5 text-ink">{room.name}</td>
                            <td className="whitespace-nowrap px-5 py-2.5 text-right tabular-nums text-ink">
                              {t("m2", { value: fmt(room.area) })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-ink/15 bg-paper-2 font-semibold">
                          <td className="px-5 py-3">{t("floorTotal")}</td>
                          <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums">{t("m2", { value: fmt(floor.total) })}</td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {house.buildEstimate.length > 0 && (
          <section className="mt-16 border-t border-line pt-12 md:mt-20">
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
        )}

        {settings.included.length > 0 && (
          <section className="mt-16 border border-line bg-paper-2 p-6 md:mt-20 md:p-10">
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
    </>
  );
}
