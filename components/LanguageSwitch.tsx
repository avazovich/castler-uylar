"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";

/** "UZ | RU" text switch. tone="dark" for dark backgrounds (top bar, menu). */
export function LanguageSwitch({ tone = "dark", className = "" }: { tone?: "light" | "dark"; className?: string }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <div role="group" aria-label={t("language")} className={`flex items-center ${className}`}>
      {locales.map((l, i) => {
        const active = l === locale;
        return (
          <span key={l} className="flex items-center">
            {i > 0 && <span className={`mx-2 h-3 w-px ${tone === "dark" ? "bg-line-on-ink" : "bg-line"}`} />}
            <button
              type="button"
              aria-pressed={active}
              // Keep the catalog filters (?sotix=…) when switching language.
              onClick={() => router.replace(`${pathname}${window.location.search}`, { locale: l, scroll: false })}
              className={`label-caps py-1 transition-colors ${
                active
                  ? tone === "dark"
                    ? "text-gold-light"
                    : "text-ink"
                  : tone === "dark"
                    ? "text-cream/55 hover:text-cream"
                    : "text-ink-soft hover:text-ink"
              }`}
            >
              {l}
            </button>
          </span>
        );
      })}
    </div>
  );
}
