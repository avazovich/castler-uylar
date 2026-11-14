"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function HeaderSearch() {
  const t = useTranslations("browse");
  const router = useRouter();
  return (
    <form role="search" className="reference-search"
      onSubmit={(event) => {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        router.push(q ? `/loyihalar?${new URLSearchParams({ q })}` : "/loyihalar");
      }}>
      <input name="q" type="search" maxLength={120} placeholder={t("keyword")} aria-label={t("keyword")} className="min-w-0 flex-1 px-3 text-sm" />
      <button className="button">{t("search")}</button>
    </form>
  );
}
