"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { filtersToQuery, PLOT_OPTIONS, WIDTH_OPTIONS } from "@/lib/filters";
import { formatNumber } from "@/lib/format";
import { ArrowRightIcon } from "./icons";

/** Home-page quick search — hands off to the catalog with the filters in the URL. */
export function FinderForm({ floorOptions }: { floorOptions: number[] }) {
  const t = useTranslations("filters");
  const browse = useTranslations("browse");
  const router = useRouter();
  const [sotix, setSotix] = useState("");
  const [qavat, setQavat] = useState("");
  const [eni, setEni] = useState("");
  const [query, setQuery] = useState("");
  const [describe, setDescribe] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    const floor = describe ? q.match(/([1-3])\s*(?:qavat(?:li)?|этаж\p{L}*)/iu) : null;
    const area = describe ? q.match(/(\d+)\s*[mм][²2]/iu) : null;
    const keyword = q.replace(floor?.[0] ?? "", "").replace(area?.[0] ?? "", "").replace(/[,;]+/g, " ").trim();
    const qs = filtersToQuery({
      sotix: !describe && sotix ? Number(sotix) : undefined,
      qavat: floor ? Number(floor[1]) : !describe && qavat ? Number(qavat) : undefined,
      eni: !describe && eni ? Number(eni) : undefined,
      q: keyword || undefined,
      min: area ? Math.max(1, Math.floor(Number(area[1]) * 0.8)) : undefined,
      max: area ? Math.ceil(Number(area[1]) * 1.2) : undefined,
      sort: "new",
    });
    router.push(qs ? `/loyihalar?${qs}` : "/loyihalar");
  }

  const fields = [
    {
      id: "sotix",
      label: t("plot"),
      value: sotix,
      set: setSotix,
      options: PLOT_OPTIONS.map((v) => ({ value: v, label: t("plotOption", { value: formatNumber(v) }) })),
    },
    {
      id: "qavat",
      label: t("floors"),
      value: qavat,
      set: setQavat,
      options: floorOptions.map((v) => ({ value: v, label: t("floorsOption", { count: v, label: formatNumber(v) }) })),
    },
    {
      id: "eni",
      label: t("width"),
      value: eni,
      set: setEni,
      options: WIDTH_OPTIONS.map((v) => ({ value: v, label: t("widthOption", { value: v }) })),
    },
  ];

  return (
    <form
      onSubmit={submit}
      className="grid max-w-[860px] overflow-hidden rounded-xl border border-line bg-paper text-ink shadow-xl sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <div className="col-span-full grid grid-cols-2 bg-paper-2">
        {[false, true].map((value) => (
          <button key={String(value)} type="button" onClick={() => setDescribe(value)} aria-pressed={describe === value}
            className={`min-h-11 border-b-2 px-3 py-2 text-sm font-bold ${describe === value ? "border-gold bg-paper" : "border-line"}`}>
            {browse(value ? "describeMode" : "filterMode")}
          </button>
        ))}
      </div>
      {!describe && fields.map((f) => (
        <label key={f.id} className="block min-w-0 border-b border-line px-5 py-4 sm:border-r lg:border-b-0">
          <span className="label-caps block text-ink-soft">{f.label}</span>
          <select
            className="field-select border-0 bg-[position:right_0_center] px-0 pb-0 pt-1.5 text-[16px]"
            value={f.value}
            data-active={f.value !== ""}
            onChange={(e) => f.set(e.target.value)}
          >
            <option value="">{t("any")}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <div className="col-span-full flex flex-wrap items-stretch gap-2 border-t border-line p-2">
        <input type="search" name="q" maxLength={120} value={query} onChange={(event) => setQuery(event.target.value)}
          aria-label={browse("keyword")} placeholder={browse(describe ? "describeHint" : "keyword")}
          className="min-w-36 flex-1 px-3 py-2 text-sm" />
        <button type="submit" className="btn bg-gold text-paper hover:bg-ink">
          {browse("search")} <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </form>
  );
}
