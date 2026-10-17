import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { telHref } from "@/lib/format";
import { getSettings } from "@/lib/houses";
import { DEFAULT_INSTAGRAM_URL, MAIN_SITE_URL } from "@/lib/site";
import { ArrowRightIcon, InstagramIcon, PhoneIcon, TelegramIcon } from "./icons";
import { Wordmark } from "./Wordmark";

export async function Footer() {
  const locale = (await getLocale()) as Locale;
  const [t, nav, settings] = await Promise.all([
    getTranslations("footer"),
    getTranslations("nav"),
    getSettings(locale),
  ]);
  const instagram = settings.instagram ?? DEFAULT_INSTAGRAM_URL;

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto grid max-w-[1360px] gap-12 px-4 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8 md:py-20">
        <div>
          <Wordmark variant="cream" height={26} />
          <p className="mt-5 max-w-sm text-cream/60">{t("tagline")}</p>
          <a
            href={`${MAIN_SITE_URL}/${locale === "ru" ? "ru" : "uz"}`}
            target="_blank"
            rel="noopener"
            className="mt-6 inline-flex items-center gap-2 text-gold-light hover:text-cream"
          >
            {t("mainSite")} <ArrowRightIcon className="h-4 w-4" />
          </a>
        </div>

        <nav className="flex flex-col gap-3">
          <p className="label-mono text-cream/40">{nav("brand")}</p>
          <Link href="/loyihalar" className="hover:text-gold-light">{nav("catalog")}</Link>
          <Link href="/#jarayon" className="hover:text-gold-light">{nav("how")}</Link>
          <Link href="/#aloqa" className="hover:text-gold-light">{nav("contact")}</Link>
        </nav>

        <div className="flex flex-col gap-3">
          <p className="label-mono text-cream/40">{t("contact")}</p>
          <a href={telHref(settings.phone)} className="inline-flex items-center gap-2 hover:text-gold-light">
            <PhoneIcon className="h-4 w-4" /> {settings.phone}
          </a>
          {settings.telegram && (
            <a
              href={`https://t.me/${settings.telegram}`}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2 hover:text-gold-light"
            >
              <TelegramIcon className="h-4 w-4" /> @{settings.telegram}
            </a>
          )}
          <a href={instagram} target="_blank" rel="noopener" className="inline-flex items-center gap-2 hover:text-gold-light">
            <InstagramIcon className="h-4 w-4" /> Instagram
          </a>
          {settings.address && <p className="text-cream/60">{settings.address}</p>}
        </div>
      </div>
      <div className="border-t border-line-on-ink">
        <p className="label-mono mx-auto max-w-[1360px] px-4 py-5 text-cream/40 md:px-8">
          {t("rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
