"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
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
import { CloseIcon } from "./icons";

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

  return (
    <div>
      <div className="mt-8 grid grid-cols-2 gap-3 rounded-3xl bg-paper-2 p-3 sm:grid-cols-3 lg:grid-cols-6 lg:p-4">
        {selects
          .filter((s) => !s.hidden)
          .map((s) => (
            <label key={s.key} className="block min-w-0">
              <span className="label-mono mb-1.5 block px-1 text-ink-soft">{s.label}</span>
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
        <label className="block min-w-0">
          <span className="label-mono mb-1.5 block px-1 text-ink-soft">{t("sort")}</span>
          <select
            className="field-select"
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

      <div className="mt-6 flex min-h-9 items-center justify-between gap-4">
        <p className="text-ink-soft" aria-live="polite">
          {t("found", { count: results.length })}
        </p>
        {active && (
          <button
            type="button"
            onClick={() => update({ sotix: undefined, qavat: undefined, eni: undefined, xona: undefined, uslub: undefined })}
            className="pill gap-1.5 bg-paper-2 px-4 py-2 text-ink hover:bg-line"
          >
            <CloseIcon className="h-4 w-4" />
            {t("reset")}
          </button>
        )}
      </div>

      {results.length > 0 ? (
        <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((h, i) => (
            <HouseCard key={h.code} house={h} priority={i < 3} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-dashed border-line px-6 py-16 text-center">
          <p className="font-display text-3xl text-ink">{houses.length ? tc("emptyTitle") : tc("noHouses")}</p>
          {houses.length > 0 && <p className="mx-auto mt-3 max-w-md text-ink-soft">{tc("emptyText")}</p>}
          <div className="mt-6 flex justify-center">{emptyAction}</div>
        </div>
      )}
    </div>
  );
}
