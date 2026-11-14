"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { filtersToQuery } from "@/lib/filters";
import { formatNumber } from "@/lib/format";

export function FinderForm({ floorOptions }: { floorOptions: number[] }) {
  const t = useTranslations("filters");
  const browse = useTranslations("browse");
  const router = useRouter();
  const [describe, setDescribe] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const description = String(data.get("description") ?? "").trim();
    const floor = description.match(/([1-3])\s*(?:qavat(?:li)?|этаж\p{L}*)/iu);
    const area = description.match(/(\d+)\s*[mм][²2]/iu);
    const words = description.replace(floor?.[0] ?? "", "").replace(area?.[0] ?? "", "").replace(/[,;]+/g, " ").trim();
    const q = [words, String(data.get("q") ?? "").trim()].filter(Boolean).join(" ");
    const amount = (key: string) => Number(data.get(key)) || undefined;
    const qs = filtersToQuery({
      q: q || undefined,
      qavat: floor ? Number(floor[1]) : amount("qavat"),
      sotix: amount("sotix"),
      min: area ? Math.max(1, Math.floor(Number(area[1]) * 0.8)) : amount("min"),
      max: area ? Math.ceil(Number(area[1]) * 1.2) : amount("max"),
      sort: "new",
    });
    router.push(qs ? `/loyihalar?${qs}` : "/loyihalar");
  }

  return (
    <form onSubmit={submit} className="finder" role="search">
      <div className="modes">
        <button type="button" aria-pressed={describe} onClick={() => setDescribe(true)}>✧ {browse("describeMode")}</button>
        <button type="button" aria-pressed={!describe} onClick={() => setDescribe(false)}>☷ {browse("filterMode")}</button>
      </div>
      {describe ? (
        <div className="describe">
          <label htmlFor="house-description">{browse("describeMode")}</label>
          <div><input id="house-description" name="description" placeholder={browse("describeHint")} maxLength={120} /><button className="button">{browse("search")}</button></div>
        </div>
      ) : (
        <div className="filters">
          <label>{t("floors")}
            <select name="qavat"><option value="">{browse("any")}</option>
              {floorOptions.map((n) => <option key={n} value={n}>{t("floorsOption", { count: n, label: formatNumber(n) })}</option>)}
            </select>
          </label>
          <label>{t("plot")}
            <select name="sotix"><option value="">{browse("any")}</option>
              {[5, 8, 12].map((n) => <option key={n} value={n}>{t("plotOption", { value: n })}</option>)}
            </select>
          </label>
          <fieldset>
            <div className="range-label" id="finder-area">{browse("area")}</div>
            <div role="group" aria-labelledby="finder-area">
              <input type="number" name="min" min="0" placeholder={browse("min")} aria-label={browse("minArea")} />
              <span aria-hidden="true">–</span>
              <input type="number" name="max" min="0" placeholder={browse("max")} aria-label={browse("maxArea")} />
            </div>
          </fieldset>
          <button className="button"><span aria-hidden="true">⌕</span> {browse("search")}</button>
        </div>
      )}
      <label className="keyword"><span aria-hidden="true">⌕</span><input name="q" type="search" aria-label={browse("keyword")} placeholder={browse("keywordHint")} maxLength={120} /></label>
    </form>
  );
}
