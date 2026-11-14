import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { browsePath, browseSections } from "@/lib/browse";
import { getSettings } from "@/lib/houses";
import { MAIN_SITE_URL } from "@/lib/site";
import { HeaderSearch } from "./HeaderSearch";
import { MobileMenu } from "./MobileMenu";
import { NavLinks } from "./NavLinks";
import { Wordmark } from "./Wordmark";

export async function Header() {
  const locale = (await getLocale()) as Locale;
  const [t, browse, settings] = await Promise.all([getTranslations("nav"), getTranslations("browse"), getSettings(locale)]);
  const items = [
    { href: "/loyihalar", label: t("catalog") },
    ...browseSections.map((section) => ({ href: browsePath(section), label: browse(section) })),
  ];

  return (
    <header className="relative z-40 border-b border-line bg-paper-2">
      <div className="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:min-h-24 md:gap-8 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Castler Uylar">
          <Wordmark height={22} />
          <span className="label-caps hidden border-l border-line pl-3 text-ink-soft sm:block">{t("brand")}</span>
        </Link>
        <HeaderSearch />
        <Link href={browsePath("consult")} className="hidden max-w-48 text-right text-sm font-bold hover:text-gold md:block">{browse("consult")} ↗</Link>
        <MobileMenu items={items} phone={settings.phone} mainSite={{ href: `${MAIN_SITE_URL}/${locale}`, label: t("mainSite") }} />
      </div>
      <div className="hidden border-t border-line lg:block">
        <div className="mx-auto flex min-h-12 max-w-[1280px] flex-wrap items-center px-8">
          <NavLinks items={items} />
        </div>
      </div>
    </header>
  );
}
