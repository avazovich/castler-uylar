"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
  const browse = useTranslations("browse");
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
  const reset = () => update({ sotix: undefined, qavat: undefined, eni: undefined, xona: undefined, uslub: undefined, q: undefined, min: undefined, max: undefined });
  const quick = floorOptions.map((floor) => ({
    label: t("floorsOption", { count: floor, label: n(floor) }),
    count: houses.filter((house) => house.floors === floor).length,
    selected: filters.qavat === floor,
    apply: () => update({ qavat: filters.qavat === floor ? undefined : floor }),
  }));

  function selectField(field: (typeof selects)[number]) {
    return <label key={field.key} className="min-w-0">
      <span className="sr-only">{field.label}</span>
      <select className="catalog-select field-select" value={field.value} onChange={(event) => field.onChange(event.target.value)}>
        <option value="">{field.label}</option>
        {field.options.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>;
  }

  return (
    <>
      <div className="catalog-controls border-b border-line pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <p aria-live="polite" className="mr-2 text-sm"><strong className="text-xl">{n(results.length)}</strong> {browse("plansUnit", { count: results.length })}</p>
          <div className="hidden flex-wrap gap-2 lg:flex">{selects.filter((field) => field.key === "qavat" || field.key === "sotix" || field.key === "uslub").filter((field) => !field.hidden).map(selectField)}</div>
          <button type="button" aria-expanded={open} aria-controls="extra-filters" onClick={() => setOpen(!open)} className="catalog-toggle">
            {browse("moreFilters")} {open ? "−" : "+"}
          </button>
          <label className="ml-auto">
            <span className="sr-only">{t("sort")}</span>
            <select className="catalog-select field-select" value={filters.sort} onChange={(event) => update({ sort: event.target.value as SortKey })}>
              {SORT_KEYS.map((key) => <option key={key} value={key}>{t(SORT_LABEL[key])}</option>)}
            </select>
          </label>
        </div>

        <div id="extra-filters" hidden={!open} className="mt-3 rounded-lg border border-line bg-white p-3">
          <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-5">{selects.filter((field) => !field.hidden).map((field) => <div key={field.key} className={field.key === "eni" || field.key === "xona" ? "" : "lg:hidden"}>{selectField(field)}</div>)}</div>
          <form key={`${filters.q}-${filters.min}-${filters.max}`} className="grid grid-cols-2 gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]" onSubmit={(event) => {
            event.preventDefault();
            const data = new FormData(event.currentTarget);
            update({ q: String(data.get("q")).trim() || undefined, min: Number(data.get("min")) || undefined, max: Number(data.get("max")) || undefined });
          }}>
            <input name="q" type="search" maxLength={120} defaultValue={filters.q} aria-label={browse("keyword")} placeholder={browse("keyword")} className="field-input col-span-2 sm:col-span-1" />
            <input name="min" type="number" min="1" defaultValue={filters.min} aria-label={browse("minArea")} placeholder={browse("minArea")} className="field-input" />
            <input name="max" type="number" min="1" defaultValue={filters.max} aria-label={browse("maxArea")} placeholder={browse("maxArea")} className="field-input" />
            <button className="btn bg-gold text-paper">{browse("search")}</button>
          </form>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
          <span className="text-ink-soft">{browse("styles")} →</span>
          {styleOptions.map((style) => <button key={style} type="button" aria-pressed={filters.uslub === style} className="font-bold hover:text-gold aria-pressed:text-gold" onClick={() => update({ uslub: filters.uslub === style ? undefined : style })}>{STYLES[style][locale]}</button>)}
          <Link href="/browse/styles" className="border-b border-gold font-bold">{browse("allStyles")} →</Link>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="label-caps mr-1 text-ink-soft">{browse("quickFilters")}</span>
          {quick.map(({ label, count, apply, selected }) => <button key={label} type="button" onClick={apply} aria-pressed={selected} className="catalog-chip">{label} <span className="text-ink-soft">({n(count)})</span></button>)}
          <button type="button" aria-pressed={filters.eni === 15} onClick={() => update({ eni: filters.eni === 15 ? undefined : 15 })} className="catalog-chip">{t("widthOption", { value: 15 })}</button>
          {active && <button type="button" onClick={reset} className="px-2 text-sm font-bold text-gold">{t("reset")} ×</button>}
        </div>
      </div>

      <div className="min-w-0">
        {results.length > 0 ? (
          <div className="stagger mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((h, i) => (
              <HouseCard key={h.code} house={h} priority={i < 3} />
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
    </>
  );
}
