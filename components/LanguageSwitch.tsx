"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales } from "@/i18n/routing";

export function LanguageSwitch({ tone = "light" }: { tone?: "light" | "dark" }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={`flex rounded-full p-0.5 ${tone === "dark" ? "bg-ink-2" : "bg-paper-2"}`}
    >
      {locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            aria-pressed={active}
            // Keep the catalog filters (?sotix=…) when switching language.
            onClick={() => router.replace(`${pathname}${window.location.search}`, { locale: l, scroll: false })}
            className={`label-mono rounded-full px-2.5 py-1.5 transition-colors ${
              active
                ? tone === "dark"
                  ? "bg-paper text-ink"
                  : "bg-ink text-paper"
                : tone === "dark"
                  ? "text-cream/70 hover:text-cream"
                  : "text-ink-soft hover:text-ink"
            }`}
          >
            {l}
          </button>
        );
      })}
    </div>
  );
}
