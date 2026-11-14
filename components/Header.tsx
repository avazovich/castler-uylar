import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { browsePath, browseSections } from "@/lib/browse";
import { getSettings } from "@/lib/houses";
import { MAIN_SITE_URL } from "@/lib/site";
import { HeaderSearch } from "./HeaderSearch";
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

  return (
    <div className="reference-header">
      <div className="announcement">
        <div className="wrap">
          <Link href="/loyihalar">{browse("announcement")}</Link>
          <LanguageSwitch tone="light" />
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
          <MobileMenu items={items} phone={settings.phone} mainSite={{ href: `${MAIN_SITE_URL}/${locale}`, label: t("mainSite") }} />
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
