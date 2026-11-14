import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { browsePath, browseSections } from "@/lib/browse";
import { telHref } from "@/lib/format";
import { getSettings } from "@/lib/houses";
import { MAIN_SITE_URL } from "@/lib/site";
import { HeaderSearch } from "./HeaderSearch";
import { PhoneIcon } from "./icons";
import { MobileMenu } from "./MobileMenu";
import { LanguageSwitch } from "./LanguageSwitch";

export async function Header() {
  const locale = (await getLocale()) as Locale;
  const [t, browse, blog, settings] = await Promise.all([getTranslations("nav"), getTranslations("browse"), getTranslations("blog"), getSettings(locale)]);
  const items = [
    { href: "/loyihalar", label: t("catalog") },
    ...browseSections.map((section) => ({ href: browsePath(section), label: browse(section) })),
    { href: "/blog", label: blog("label") },
  ];
  const mainSite = { href: `${MAIN_SITE_URL}/${locale}`, label: t("mainSite") };

  return (
    <div className="reference-header">
      <div className="announcement">
        <div className="wrap">
          {/* The way back to the Castler studio site (phones: it is in the menu). */}
          <a href={mainSite.href} target="_blank" rel="noopener" className="announce-site" aria-label={mainSite.label}>
            castler.uz <span aria-hidden="true">↗</span>
          </a>
          <Link href="/loyihalar" className="announce-text">
            <span className="announce-long">{browse("announcement")}</span>
            <span className="announce-short">{browse("announcementShort")}</span>
          </Link>
          <LanguageSwitch tone="light" className="language" />
        </div>
      </div>
      <header className="bg-paper">
        <div className="wrap mast">
          <Link href="/" className="logo">
            <Image src="/brand/mark-ink.png" alt="" width={44} height={44} />
            CASTLER UYLAR
          </Link>
          <HeaderSearch />
          <Link href={browsePath("consult")} className="contact">
            <small>{browse("contactLabel")}</small><strong>{browse("contactAction")} ↗</strong>
          </Link>
          <a href={telHref(settings.phone)} className="mast-call" aria-label={`${t("call")}: ${settings.phone}`}>
            <PhoneIcon />
          </a>
          <MobileMenu items={items} phone={settings.phone} telegram={settings.telegram} mainSite={mainSite} />
        </div>
        <nav className="nav">
          <div className="wrap">
            {items.filter((item) => item.href !== browsePath("consult")).map((item) => <Link key={item.href} href={item.href} className={item.href === "/blog" ? "nav-cta" : undefined}>{item.label}</Link>)}
          </div>
        </nav>
      </header>
    </div>
  );
}
