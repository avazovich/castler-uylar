import type { HouseSummary } from "./houses";
import { STYLES, type Style } from "./vocab";

// "Fits my plot" thresholds: a house shows up when it needs at most this
// much land / frontage — what a buyer actually knows about their plot.
export const PLOT_OPTIONS = [2, 3, 4, 5, 6, 8, 10, 15, 20];
export const WIDTH_OPTIONS = [10, 12, 15, 18, 20, 25, 30];
export const BEDROOM_OPTIONS = [2, 3, 4, 5];

export const SORT_KEYS = ["new", "cheap", "expensive", "small", "large"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export interface Filters {
  /** max sotix the house may need */
  sotix?: number;
  /** exact number of floors */
  qavat?: number;
  /** max plot width (m) the house may need */
  eni?: number;
  /** at least this many bedrooms */
  xona?: number;
  uslub?: Style;
  sort: SortKey;
}

const num = (v: string | null) => {
  const n = v == null || v === "" ? NaN : Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function parseFilters(sp: URLSearchParams): Filters {
  const style = sp.get("uslub");
  const sort = sp.get("sort");
  return {
    sotix: num(sp.get("sotix")),
    qavat: num(sp.get("qavat")),
    eni: num(sp.get("eni")),
    xona: num(sp.get("xona")),
    uslub: style && style in STYLES ? (style as Style) : undefined,
    sort: SORT_KEYS.includes(sort as SortKey) ? (sort as SortKey) : "new",
  };
}

export function filtersToQuery(f: Filters): string {
  const sp = new URLSearchParams();
  if (f.sotix) sp.set("sotix", String(f.sotix));
  if (f.qavat) sp.set("qavat", String(f.qavat));
  if (f.eni) sp.set("eni", String(f.eni));
  if (f.xona) sp.set("xona", String(f.xona));
  if (f.uslub) sp.set("uslub", f.uslub);
  if (f.sort !== "new") sp.set("sort", f.sort);
  return sp.toString();
}

export function hasActiveFilters(f: Filters): boolean {
  return Boolean(f.sotix || f.qavat || f.eni || f.xona || f.uslub);
}

export function applyFilters(houses: HouseSummary[], f: Filters): HouseSummary[] {
  const list = houses.filter(
    (h) =>
      (!f.sotix || h.plotSotix <= f.sotix) &&
      (!f.qavat || h.floors === f.qavat) &&
      // Unknown width can't be promised to fit, so it's left out once the
      // visitor asks for a width.
      (!f.eni || (h.minPlotWidth != null && h.minPlotWidth <= f.eni)) &&
      (!f.xona || h.bedrooms >= f.xona) &&
      (!f.uslub || h.style === f.uslub),
  );
  const by: Record<SortKey, (a: HouseSummary, b: HouseSummary) => number> = {
    new: (a, b) => b.code - a.code,
    cheap: (a, b) => a.priceUzs - b.priceUzs,
    expensive: (a, b) => b.priceUzs - a.priceUzs,
    small: (a, b) => a.totalArea - b.totalArea,
    large: (a, b) => b.totalArea - a.totalArea,
  };
  return list.sort(by[f.sort]);
}
