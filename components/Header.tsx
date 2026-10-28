import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { getSettings } from "@/lib/houses";
import { MAIN_SITE_URL } from "@/lib/site";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { Wordmark } from "./Wordmark";

export async function Header() {
  const locale = (await getLocale()) as Locale;
  const [t, settings] = await Promise.all([getTranslations("nav"), getSettings(locale)]);
  const items = [
    { href: "/", label: t("home") },
    { href: "/loyihalar", label: t("catalog") },
    { href: "/#jarayon", label: t("how") },
    { href: "/#aloqa", label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-8 px-4 md:h-20 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-4" aria-label="Castler">
          <Wordmark height={22} />
          <span className="hidden h-7 w-px bg-line sm:block lg:hidden xl:block" />
          <span className="label-caps hidden text-ink-soft sm:block lg:hidden xl:block">{t("brand")}</span>
        </Link>

        <div className="ml-auto flex h-full items-center gap-8">
          <NavLinks items={items} />
          <Link href="/#aloqa" className="btn hidden bg-ink text-paper hover:bg-gold md:inline-flex">
            {t("request")}
          </Link>
          <MobileMenu
            items={items}
            phone={settings.phone}
            mainSite={{ href: `${MAIN_SITE_URL}/${locale}`, label: t("mainSite") }}
          />
        </div>
      </div>
    </header>
  );
}
