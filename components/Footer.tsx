import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { collectionHref, liveCollections } from "@/lib/collections";
import { telHref } from "@/lib/format";
import { getHouses, getSettings, toSummary } from "@/lib/houses";
import { DEFAULT_INSTAGRAM_URL, MAIN_SITE_URL } from "@/lib/site";
import { ArrowRightIcon, InstagramIcon, PhoneIcon, TelegramIcon } from "./icons";
import { Wordmark } from "./Wordmark";

export async function Footer() {
  const locale = (await getLocale()) as Locale;
  const [t, nav, settings, houses] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
    getSettings(locale),
    getHouses(locale),
  ]);
  const instagram = settings.instagram ?? DEFAULT_INSTAGRAM_URL;

  // Category pages that currently have houses — real, crawlable links.
  const quick = liveCollections(houses.map(toSummary))
    .filter(({ collection: c }) => c.group === "floors" || c.group === "style" || c.group === "feature")
    .map(({ collection: c }) => ({ href: collectionHref(c, locale), label: c.title[locale] }));

  const heading = "label-caps mb-5 text-cream/45";
  const link = "text-cream/80 transition-colors hover:text-gold-light";

  return (
    <footer className="border-t-4 border-gold bg-ink text-cream">
      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 py-14 sm:grid-cols-2 md:px-8 md:py-16 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div>
          <Wordmark variant="cream" height={26} />
          <p className="mt-6 max-w-xs text-cream/60">{t("tagline")}</p>
          <a
            href={`${MAIN_SITE_URL}/${locale}`}
            target="_blank"
            rel="noopener"
            className="mt-5 inline-flex items-center gap-2 text-gold-light transition-colors hover:text-cream"
          >
            {t("mainSite")} — castler.uz
            <ArrowRightIcon className="h-4 w-4 -rotate-45" />
          </a>
        </div>

        <nav className="flex flex-col gap-3">
          <p className={heading}>{nav("brand")}</p>
          <Link href="/" className={link}>{nav("home")}</Link>
          <Link href="/loyihalar" className={link}>{nav("catalog")}</Link>
          <Link href="/#jarayon" className={link}>{nav("how")}</Link>
          <Link href="/#aloqa" className={link}>{nav("contact")}</Link>
        </nav>

        {quick.length > 0 && (
          <nav className="flex flex-col gap-3">
            <p className={heading}>{t("byFloors")}</p>
            {quick.map((q) => (
              <Link key={q.href} href={q.href} className={link}>
                {q.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex flex-col gap-3">
          <p className={heading}>{t("contact")}</p>
          <a href={telHref(settings.phone)} className={`inline-flex items-center gap-2.5 ${link}`}>
            <PhoneIcon className="h-4 w-4 text-gold-light" /> {settings.phone}
          </a>
          {settings.telegram && (
            <a
              href={`https://t.me/${settings.telegram}`}
              target="_blank"
              rel="noopener"
              className={`inline-flex items-center gap-2.5 ${link}`}
            >
              <TelegramIcon className="h-4 w-4 text-gold-light" /> @{settings.telegram}
            </a>
          )}
          <a href={instagram} target="_blank" rel="noopener" className={`inline-flex items-center gap-2.5 ${link}`}>
            <InstagramIcon className="h-4 w-4 text-gold-light" /> Instagram
          </a>
          {settings.address && <p className="text-cream/60">{settings.address}</p>}
        </div>
      </div>

      <div className="border-t border-line-on-ink">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-[13px] text-cream/45 md:px-8">
          <p>{t("rights", { year: new Date().getFullYear() })}</p>
          <a href={`${MAIN_SITE_URL}/${locale}`} target="_blank" rel="noopener" className="hover:text-gold-light">
            {t("mainSite")} — castler.uz
          </a>
        </div>
      </div>
    </footer>
  );
}
