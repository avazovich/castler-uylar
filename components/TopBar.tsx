import { getLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { telHref } from "@/lib/format";
import { getSettings } from "@/lib/houses";
import { DEFAULT_INSTAGRAM_URL } from "@/lib/site";
import { InstagramIcon, PhoneIcon, TelegramIcon } from "./icons";
import { LanguageSwitch } from "./LanguageSwitch";

/** Thin dark strip above the header: contacts on the left, language on the right. */
export async function TopBar() {
  const locale = (await getLocale()) as Locale;
  const [t, settings] = await Promise.all([getTranslations("nav"), getSettings(locale)]);

  return (
    <div className="bg-ink text-[13px] text-cream/75">
      <div className="mx-auto flex h-10 max-w-[1280px] items-center gap-6 px-4 md:px-8">
        <a href={telHref(settings.phone)} className="inline-flex items-center gap-2 hover:text-cream">
          <PhoneIcon className="h-3.5 w-3.5 text-gold-light" />
          {settings.phone}
        </a>
        {settings.telegram && (
          <a
            href={`https://t.me/${settings.telegram}`}
            target="_blank"
            rel="noopener"
            className="hidden items-center gap-2 hover:text-cream sm:inline-flex"
          >
            <TelegramIcon className="h-3.5 w-3.5 text-gold-light" />@{settings.telegram}
          </a>
        )}
        <a
          href={settings.instagram ?? DEFAULT_INSTAGRAM_URL}
          target="_blank"
          rel="noopener"
          className="hidden items-center gap-2 hover:text-cream sm:inline-flex"
        >
          <InstagramIcon className="h-3.5 w-3.5 text-gold-light" />
          Instagram
        </a>
        <span className="ml-auto hidden text-cream/50 lg:block">{settings.address ?? t("company")}</span>
        <LanguageSwitch className="ml-auto lg:ml-0" />
      </div>
    </div>
  );
}
