import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FinderForm } from "@/components/FinderForm";
import { HouseCard } from "@/components/HouseCard";
import { ArrowRightIcon, CheckIcon, PhoneIcon, TelegramIcon } from "@/components/icons";
import { LeadForm } from "@/components/LeadForm";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatNumber, telHref } from "@/lib/format";
import { getHouses, getSettings, toSummary } from "@/lib/houses";
import { AREA_REALIZED_M2, FOUNDING_YEAR } from "@/lib/site";

export const revalidate = 60;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);

  const [t, houses, settings] = await Promise.all([getTranslations("home"), getHouses(locale), getSettings(locale)]);

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

  return (
    <>
      {/* Hero */}
      <section className="px-3 pt-3 md:px-6 md:pt-5">
        <div className="relative mx-auto flex min-h-[620px] max-w-[1400px] flex-col justify-end overflow-hidden rounded-[28px] bg-ink md:min-h-[680px]">
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
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
          <div className="relative z-10 px-4 pb-4 pt-24 sm:px-8 sm:pb-8 md:px-12 md:pb-12">
            {houses.length > 0 && (
              <p className="label-mono inline-flex rounded-full bg-ink/50 px-3 py-1.5 text-gold-light backdrop-blur">
                {t("eyebrow", { count: houses.length })}
              </p>
            )}
            <h1 className="font-display mt-4 max-w-4xl text-[44px] leading-[1.02] text-paper sm:text-6xl md:text-[84px]">
              {t("title")}
            </h1>
            <p className="mt-5 max-w-xl text-[17px] text-paper/75 md:text-lg">{t("subtitle")}</p>
            <div className="mt-8 max-w-4xl md:mt-10">
              <FinderForm floorOptions={floorOptions} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-[1360px] px-4 md:px-8">
        <dl className="grid grid-cols-1 divide-y divide-line border-b border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((s) => (
            <div key={s.label} className="py-7 sm:px-8 sm:first:pl-0">
              <dt className="sr-only">{s.label}</dt>
              <dd className="font-display text-5xl text-ink">{s.value}</dd>
              <dd className="mt-1 text-ink-soft">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Featured */}
      {picked.length > 0 && (
        <section className="mx-auto max-w-[1360px] px-4 pt-20 md:px-8 md:pt-28">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-display text-4xl text-ink md:text-6xl">{t("featuredTitle")}</h2>
            <Link href="/loyihalar" className="pill hidden shrink-0 border border-line text-ink hover:border-ink sm:inline-flex">
              {t("allProjects")} <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
            {picked.map((h) => (
              <HouseCard key={h.code} house={toSummary(h)} />
            ))}
          </div>
          <Link href="/loyihalar" className="pill mt-10 w-full border border-line text-ink sm:hidden">
            {t("allProjects")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* How it works */}
      <section id="jarayon" className="mx-auto max-w-[1360px] px-4 pt-24 md:px-8 md:pt-32">
        <p className="label-mono text-gold">{t("howEyebrow")}</p>
        <h2 className="font-display mt-3 text-4xl text-ink md:text-6xl">{t("howTitle")}</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col rounded-3xl bg-paper-2 p-6 md:p-7">
              <span className="font-display text-5xl text-gold">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-10 text-xl font-medium text-ink">{step.title}</h3>
              <p className="mt-2 text-ink-soft">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* What's included — editable in Studio → Site settings */}
      {settings.included.length > 0 && (
        <section className="mx-auto max-w-[1360px] px-4 pt-24 md:px-8 md:pt-32">
          <div className="grid gap-10 border-t border-line pt-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="label-mono text-gold">{t("includedEyebrow")}</p>
              <h2 className="font-display mt-3 text-4xl text-ink md:text-5xl">{t("includedTitle")}</h2>
            </div>
            <ul className="grid gap-x-8 sm:grid-cols-2">
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
      <section id="aloqa" className="px-3 pb-3 pt-24 md:px-6 md:pb-6 md:pt-32">
        <div className="mx-auto grid max-w-[1400px] gap-10 rounded-[28px] bg-ink px-5 py-10 text-cream sm:px-8 md:px-12 md:py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div>
            <p className="label-mono text-gold-light">{t("customEyebrow")}</p>
            <h2 className="font-display mt-3 text-4xl md:text-6xl">{t("customTitle")}</h2>
            <p className="mt-5 max-w-lg text-lg text-cream/70">{t("customText")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={telHref(settings.phone)} className="pill border border-line-on-ink text-cream hover:border-cream">
                <PhoneIcon className="h-4 w-4" /> {settings.phone}
              </a>
              {settings.telegram && (
                <a
                  href={`https://t.me/${settings.telegram}`}
                  target="_blank"
                  rel="noopener"
                  className="pill border border-line-on-ink text-cream hover:border-cream"
                >
                  <TelegramIcon className="h-4 w-4" /> Telegram
                </a>
              )}
            </div>
          </div>
          <div className="rounded-3xl bg-ink-2 p-5 sm:p-7">
            <LeadForm phone={settings.phone} tone="dark" />
          </div>
        </div>
      </section>
    </>
  );
}
