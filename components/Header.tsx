import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { telHref } from "@/lib/format";
import { getSettings } from "@/lib/houses";
import { PhoneIcon } from "./icons";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "./MobileMenu";
import { Wordmark } from "./Wordmark";

export async function Header() {
  const locale = (await getLocale()) as Locale;
  const [t, settings] = await Promise.all([getTranslations("nav"), getSettings(locale)]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1360px] items-center gap-4 px-4 md:h-[72px] md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label="Castler">
          <Wordmark height={20} />
          <span className="hidden h-5 w-px bg-line sm:block" />
          <span className="label-mono hidden text-ink-soft sm:block">{t("brand")}</span>
        </Link>

        <nav className="ml-6 hidden items-center gap-1 md:flex">
          {[
            { href: "/loyihalar", label: t("catalog") },
            { href: "/#jarayon", label: t("how") },
            { href: "/#aloqa", label: t("contact") },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3.5 py-2 text-[14px] text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LanguageSwitch />
          <a
            href={telHref(settings.phone)}
            aria-label={t("call")}
            className="pill hidden bg-ink px-4 py-2.5 text-paper hover:bg-ink-2 md:inline-flex"
          >
            <PhoneIcon className="h-4 w-4" />
            {settings.phone}
          </a>
          <MobileMenu phone={settings.phone} />
        </div>
      </div>
    </header>
  );
}
