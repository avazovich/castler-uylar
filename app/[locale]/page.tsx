import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FinderForm } from "@/components/FinderForm";
import { HouseCard } from "@/components/HouseCard";
import { ArrowRightIcon, CheckIcon, InstagramIcon, PhoneIcon, TelegramIcon } from "@/components/icons";
import { LeadForm } from "@/components/LeadForm";
import { SectionTitle } from "@/components/PageHeader";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatNumber, telHref } from "@/lib/format";
import { getHouses, getSettings, toSummary } from "@/lib/houses";
import { AREA_REALIZED_M2, DEFAULT_INSTAGRAM_URL, FOUNDING_YEAR } from "@/lib/site";

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [t, nav, houses, settings] = await Promise.all([
    getTranslations("home"),
    getTranslations("nav"),
    getHouses(locale),
    getSettings(locale),
  ]);

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
      {/* Hero — full-width banner, text on the left */}
      <section className="relative flex min-h-[600px] items-center overflow-hidden bg-ink md:min-h-[680px]">
        {hero && (
          <Image
            src={hero.cover.url}
            alt=""
            fill
            priority
            sizes="100vw"
            placeholder={hero.cover.lqip ? "blur" : "empty"}
            blurDataURL={hero.cover.lqip}
            style={{ objectPosition: hero.cover.position }}
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/60 to-ink/15" />
        <div className={`relative z-10 w-full pb-28 pt-16 md:pb-36 ${container}`}>
          {houses.length > 0 && (
            <p className="label-caps flex items-center gap-3 text-gold-light">
              <span className="h-px w-10 bg-current" />
              {t("eyebrow", { count: houses.length })}
            </p>
          )}
          <h1 className="font-display mt-6 max-w-3xl text-[50px] leading-[1.02] text-paper sm:text-[64px] md:text-[84px]">
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-paper/75 md:text-lg">{t("subtitle")}</p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/loyihalar" className="btn w-full bg-gold text-paper hover:bg-paper hover:text-ink sm:w-auto">
              {t("viewCatalog")} <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link href="/#aloqa" className="btn w-full border border-paper/50 text-paper hover:border-paper hover:bg-paper hover:text-ink sm:w-auto">
              {nav("request")}
            </Link>
          </div>
        </div>
      </section>

      {/* Search panel straddling the banner's bottom edge */}
      <section className={`relative z-20 -mt-16 md:-mt-[52px] ${container}`}>
        <FinderForm floorOptions={floorOptions} />
      </section>

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

      {/* Custom project / contact */}
      <section id="aloqa" className={`bg-ink text-cream ${settings.included.length ? "" : "mt-20 md:mt-28"}`}>
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
