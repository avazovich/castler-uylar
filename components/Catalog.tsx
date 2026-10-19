"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Locale } from "@/i18n/routing";
import {
  applyFilters,
  BEDROOM_OPTIONS,
  filtersToQuery,
  hasActiveFilters,
  parseFilters,
  PLOT_OPTIONS,
  SORT_KEYS,
  WIDTH_OPTIONS,
  type Filters,
  type SortKey,
} from "@/lib/filters";
import { formatNumber } from "@/lib/format";
import type { HouseSummary } from "@/lib/houses";
import { STYLES, type Style } from "@/lib/vocab";
import { HouseCard } from "./HouseCard";
import { ChevronRightIcon, CloseIcon } from "./icons";

const SORT_LABEL: Record<SortKey, string> = {
  new: "sortNew",
  cheap: "sortCheap",
  expensive: "sortExpensive",
  small: "sortSmall",
  large: "sortLarge",
};

/** Filtering happens in the browser: the whole catalog is a few hundred
 *  small records at most, so every change is instant and the URL (?sotix=…)
 *  stays shareable. */
export function Catalog({ houses, emptyAction }: { houses: HouseSummary[]; emptyAction: React.ReactNode }) {
  const t = useTranslations("filters");
  const tc = useTranslations("catalog");
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseFilters(new URLSearchParams(searchParams.toString())), [searchParams]);
  const results = useMemo(() => applyFilters(houses, filters), [houses, filters]);
  // Phones: filters fold into one bar so the houses show on the first screen.
  const [open, setOpen] = useState(false);

  const floorOptions = useMemo(() => [...new Set(houses.map((h) => h.floors))].sort((a, b) => a - b), [houses]);
  const styleOptions = useMemo(
    () => (Object.keys(STYLES) as Style[]).filter((s) => houses.some((h) => h.style === s)),
    [houses],
  );

  function update(patch: Partial<Filters>) {
    const qs = filtersToQuery({ ...filters, ...patch });
    // Next.js keeps useSearchParams in sync with the native History API.
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }

  const n = formatNumber;
  const toNum = (v: string) => (v ? Number(v) : undefined);

  const selects: {
    key: keyof Filters;
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (v: string) => void;
    hidden?: boolean;
  }[] = [
    {
      key: "sotix",
      label: t("plot"),
      value: String(filters.sotix ?? ""),
      options: PLOT_OPTIONS.map((v) => ({ value: String(v), label: t("plotOption", { value: n(v) }) })),
      onChange: (v) => update({ sotix: toNum(v) }),
    },
    {
      key: "qavat",
      label: t("floors"),
      value: String(filters.qavat ?? ""),
      options: floorOptions.map((v) => ({ value: String(v), label: t("floorsOption", { count: v, label: n(v) }) })),
      onChange: (v) => update({ qavat: toNum(v) }),
    },
    {
      key: "eni",
      label: t("width"),
      value: String(filters.eni ?? ""),
      options: WIDTH_OPTIONS.map((v) => ({ value: String(v), label: t("widthOption", { value: v }) })),
      onChange: (v) => update({ eni: toNum(v) }),
    },
    {
      key: "xona",
      label: t("bedrooms"),
      value: String(filters.xona ?? ""),
      options: BEDROOM_OPTIONS.map((v) => ({ value: String(v), label: t("bedroomsOption", { value: v }) })),
      onChange: (v) => update({ xona: toNum(v) }),
    },
    {
      key: "uslub",
      label: t("style"),
      value: filters.uslub ?? "",
      options: styleOptions.map((s) => ({ value: s, label: STYLES[s][locale] })),
      onChange: (v) => update({ uslub: (v || undefined) as Style | undefined }),
      hidden: styleOptions.length < 2,
    },
  ];

  const active = hasActiveFilters(filters);
  const activeCount = [filters.sotix, filters.qavat, filters.eni, filters.xona, filters.uslub].filter(Boolean).length;
  const reset = () => update({ sotix: undefined, qavat: undefined, eni: undefined, xona: undefined, uslub: undefined });

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10">
      {/* Filters — a column on desktop, a block above the results on phones */}
      <aside className="self-start border border-line bg-paper lg:sticky lg:top-28">
        <div className={`flex items-center justify-between bg-paper-2 px-5 py-4 lg:border-b lg:border-line ${open ? "border-b border-line" : ""}`}>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="label-caps flex items-center gap-2 text-ink lg:pointer-events-none"
          >
            <ChevronRightIcon className={`h-4 w-4 transition-transform lg:hidden ${open ? "rotate-90" : ""}`} />
            {t("title")}
            {activeCount > 0 && <span className="bg-ink px-1.5 py-0.5 text-[10px] text-paper">{activeCount}</span>}
          </button>
          {active && (
            <button type="button" onClick={reset} className="label-caps inline-flex items-center gap-1.5 text-ink-soft hover:text-ink">
              <CloseIcon className="h-3.5 w-3.5" />
              {t("reset")}
            </button>
          )}
        </div>
        <div className={`grid-cols-2 gap-x-4 gap-y-5 p-5 lg:grid lg:grid-cols-1 ${open ? "grid" : "hidden"}`}>
          {selects
            .filter((s) => !s.hidden)
            .map((s) => (
              <label key={s.key} className="block min-w-0">
                <span className="label-caps mb-2 block text-ink-soft">{s.label}</span>
                <select
                  className="field-select"
                  value={s.value}
                  data-active={s.value !== ""}
                  onChange={(e) => s.onChange(e.target.value)}
                >
                  <option value="">{t("any")}</option>
                  {s.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            ))}
        </div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
          <p className="text-ink-soft" aria-live="polite">
            {t("found", { count: results.length })}
          </p>
          <label className="flex items-center gap-3">
            <span className="label-caps text-ink-soft">{t("sort")}</span>
            <select
              className="field-select w-auto min-w-[160px] py-2"
              value={filters.sort}
              onChange={(e) => update({ sort: e.target.value as SortKey })}
            >
              {SORT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {t(SORT_LABEL[k])}
                </option>
              ))}
            </select>
          </label>
        </div>

        {results.length > 0 ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {results.map((h, i) => (
              <HouseCard key={h.code} house={h} priority={i < 2} />
            ))}
          </div>
        ) : (
          <div className="mt-6 border border-line bg-paper-2 px-6 py-16 text-center">
            <p className="font-display text-[34px] text-ink">{houses.length ? tc("emptyTitle") : tc("noHouses")}</p>
            {houses.length > 0 && <p className="mx-auto mt-3 max-w-md text-ink-soft">{tc("emptyText")}</p>}
            <div className="mt-8 flex justify-center gap-3">
              {active && (
                <button type="button" onClick={reset} className="btn border border-ink text-ink hover:bg-ink hover:text-paper">
                  {t("reset")}
                </button>
              )}
              {emptyAction}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
