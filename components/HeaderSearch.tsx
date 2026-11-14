"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";

export function HeaderSearch() {
  const t = useTranslations("browse");
  const router = useRouter();
  return (
    <form role="search" className="hidden max-w-2xl flex-1 gap-1 rounded-md border border-line bg-paper p-1 md:flex"
      onSubmit={(event) => {
        event.preventDefault();
        const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
        router.push(q ? `/loyihalar?${new URLSearchParams({ q })}` : "/loyihalar");
      }}>
      <input name="q" type="search" maxLength={120} placeholder={t("keyword")} aria-label={t("keyword")} className="min-w-0 flex-1 px-3 text-sm" />
      <button className="btn bg-gold text-white hover:bg-ink">{t("search")}</button>
    </form>
  );
}
