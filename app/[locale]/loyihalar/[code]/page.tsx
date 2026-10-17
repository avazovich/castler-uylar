import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Gallery } from "@/components/Gallery";
import { HouseCard } from "@/components/HouseCard";
import { ArrowLeftIcon, CheckIcon, PhoneIcon, TelegramIcon } from "@/components/icons";
import { LeadDialog } from "@/components/LeadDialog";
import { Link } from "@/i18n/navigation";
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

  const [t, common, home, settings, all] = await Promise.all([
    getTranslations("house"),
    getTranslations("common"),
    getTranslations("home"),
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

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-24 pt-6 md:px-8 md:pt-8">
      <Link href="/loyihalar" className="inline-flex items-center gap-2 text-sm text-ink-soft hover:text-ink">
        <ArrowLeftIcon className="h-4 w-4" /> {t("back")}
      </Link>

      <div className="mt-5 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <Gallery images={images} title={title} />

        <aside className="self-start lg:sticky lg:top-24">
          {house.isSample && (
            <p className="mb-5 rounded-2xl border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
              <span className="label-mono mr-2 text-gold">{common("sample")}</span>
              {t("sampleNotice")}
            </p>
          )}
          <p className="label-mono text-ink-soft">
            № {house.code}
            {house.style ? ` · ${STYLES[house.style][locale]}` : ""}
          </p>
          <h1 className="font-display mt-2 text-[40px] leading-[1.05] text-ink md:text-5xl">{title}</h1>

          <div className="mt-6 flex flex-wrap items-baseline gap-x-3">
            <p className="text-3xl font-medium text-ink">{common("price", { amount: fmt(house.priceUzs) })}</p>
            {house.oldPriceUzs && (
              <p className="text-lg text-ink-soft line-through">{common("price", { amount: fmt(house.oldPriceUzs) })}</p>
            )}
          </div>
          <p className="mt-1 text-sm text-ink-soft">{t("priceNote")}</p>

          <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {specs.map((s) => (
              <div key={s.label} className="bg-paper px-4 py-3.5">
                <dt className="text-xs text-ink-soft">{s.label}</dt>
                <dd className="mt-1 text-lg font-medium text-ink">{s.value}</dd>
              </div>
            ))}
          </dl>

          <LeadDialog
            houseCode={house.code}
            houseTitle={`№ ${house.code}${house.name ? ` «${house.name}»` : ""}`}
            phone={settings.phone}
            className="pill mt-6 w-full bg-ink py-4 text-[15px] text-paper hover:bg-ink-2"
          >
            {t("discuss")}
          </LeadDialog>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {settings.telegram && (
              <a
                href={`https://t.me/${settings.telegram}`}
                target="_blank"
                rel="noopener"
                className="pill border border-line px-3 text-ink hover:border-ink"
              >
                <TelegramIcon className="h-4 w-4" /> Telegram
              </a>
            )}
            <a
              href={telHref(settings.phone)}
              className={`pill border border-line px-3 text-ink hover:border-ink ${settings.telegram ? "" : "col-span-2"}`}
            >
              <PhoneIcon className="h-4 w-4" /> {t("call")}
            </a>
          </div>
        </aside>
      </div>

      {house.description && (
        <section className="mt-16 max-w-3xl md:mt-20">
          <h2 className="label-mono text-gold">{t("about")}</h2>
          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink">{house.description}</p>
        </section>
      )}

      {house.floorPlans.length > 0 && (
        <section className="mt-16 md:mt-20">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-4xl text-ink md:text-5xl">{t("plansTitle")}</h2>
            {roomsTotal > 0 && <p className="text-ink-soft">{t("plansTotal", { value: fmt(roomsTotal) })}</p>}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {house.floorPlans.map((floor, i) => (
              <article key={`${floor.level}-${i}`} className="rounded-3xl bg-paper-2 p-5 md:p-7">
                <header className="flex items-baseline justify-between gap-3">
                  <h3 className="text-xl font-medium text-ink">{floor.label}</h3>
                  {floor.total > 0 && <p className="text-sm tabular-nums text-ink-soft">{t("m2", { value: fmt(floor.total) })}</p>}
                </header>
                {floor.plan && (
                  <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-2xl bg-paper">
                    <Image
                      src={floor.plan.url}
                      alt={t("planAlt", { level: floor.label })}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-contain p-3"
                    />
                  </div>
                )}
                {floor.rooms.length > 0 && (
                  <ul className="mt-5">
                    {floor.rooms.map((room, j) => (
                      <li key={j} className="flex items-end py-1.5 text-[15px]">
                        <span className="text-ink">{room.name}</span>
                        <span className="leader" />
                        <span className="whitespace-nowrap tabular-nums text-ink">{t("m2", { value: fmt(room.area) })}</span>
                      </li>
                    ))}
                    <li className="mt-2 flex items-end border-t border-line pt-3 text-[15px] font-medium">
                      <span>{t("floorTotal")}</span>
                      <span className="leader border-transparent" />
                      <span className="whitespace-nowrap tabular-nums">{t("m2", { value: fmt(floor.total) })}</span>
                    </li>
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {house.buildEstimate.length > 0 && (
        <section className="mt-16 md:mt-20">
          <h2 className="font-display text-4xl text-ink md:text-5xl">{t("costTitle")}</h2>
          <p className="mt-2 text-ink-soft">{t("costSubtitle")}</p>
          <div className="mt-8 overflow-x-auto rounded-3xl border border-line">
            <table className="w-full min-w-[420px] text-left text-[15px]">
              <thead className="bg-paper-2">
                <tr>
                  <th className="label-mono px-5 py-3 font-semibold text-ink-soft">{t("costPart")}</th>
                  <th className="label-mono px-5 py-3 text-right font-semibold text-ink-soft">{t("costArea")}</th>
                  <th className="label-mono px-5 py-3 text-right font-semibold text-ink-soft">{t("costSum")}</th>
                </tr>
              </thead>
              <tbody>
                {house.buildEstimate.map((c, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="px-5 py-3.5 text-ink">{c.label}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-ink-soft">
                      {c.area ? t("m2", { value: fmt(c.area) }) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-ink">{formatUsd(c.costUsd)}</td>
                  </tr>
                ))}
                <tr className="border-t border-ink/20 bg-paper-2 font-medium">
                  <td className="px-5 py-4">{t("costTotal")}</td>
                  <td />
                  <td className="px-5 py-4 text-right tabular-nums">{formatUsd(costTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-ink-soft">{t("costNote")}</p>
        </section>
      )}

      {settings.included.length > 0 && (
        <section className="mt-16 rounded-3xl bg-ink p-6 text-cream md:mt-20 md:p-10">
          <h2 className="font-display text-3xl md:text-4xl">{home("includedTitle")}</h2>
          <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
            {settings.included.map((item) => (
              <li key={item} className="flex gap-3 border-b border-line-on-ink py-3.5">
                <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-light" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {similar.length > 0 && (
        <section className="mt-16 md:mt-24">
          <h2 className="font-display text-4xl text-ink md:text-5xl">{t("similar")}</h2>
          <div className="mt-8 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {similar.map((h) => (
              <HouseCard key={h.code} house={toSummary(h)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
