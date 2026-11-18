/**
 * House-cost calculator: turns a few answers (area, floors, style, walls,
 * roof, how finished) into quantities — m³ of concrete, tonnes of rebar,
 * bricks, m² of windows… — and prices every line from PRICES.
 *
 * The quantities come from rules of thumb for a typical Namangan house
 * (seismic zone 8–9, strip foundation, monolithic slabs, 1.5-brick outer
 * walls). They are documented next to each constant so a builder can check
 * and tune them. Pure: no I/O, no React.
 */
import { PRICES, type L, type PriceId, type PriceKind, type PriceSource } from "./prices";

export type Floors = 1 | 1.5 | 2 | 2.5 | 3;
export type Style = "modern" | "neoclassic" | "classic";
export type Walls = "brick" | "gasblock";
export type Roof = "pitched" | "flat";
export type Finish = "shell" | "rough" | "turnkey";

export interface CostInput {
  /** Living area above ground, m². */
  area: number;
  floors: Floors;
  basement: boolean;
  style: Style;
  walls: Walls;
  roof: Roof;
  finish: Finish;
  /** Plot size in sotix (1 sotix = 100 m²) — sizes the fence and yard paths. */
  plotSotix: number;
  fence: boolean;
  paving: boolean;
}

export const FLOOR_CHOICES: Floors[] = [1, 1.5, 2, 2.5, 3];

export const DEFAULT_INPUT: CostInput = {
  area: 150,
  floors: 2,
  basement: false,
  style: "modern",
  walls: "brick",
  roof: "pitched",
  finish: "turnkey",
  plotSotix: 6,
  fence: false,
  paving: false,
};

export type StageId =
  | "foundation" | "basement" | "walls" | "slabs" | "roof" | "openings"
  | "engineering" | "rough" | "facade" | "finishing" | "yard" | "extra";

export const STAGES: Record<StageId, L> = {
  foundation: { uz: "Poydevor", ru: "Фундамент" },
  basement: { uz: "Yerto‘la", ru: "Подвал" },
  walls: { uz: "Devorlar va seysmik karkas", ru: "Стены и сейсмокаркас" },
  slabs: { uz: "Orayopma va zinapoya", ru: "Перекрытия и лестница" },
  roof: { uz: "Tom", ru: "Кровля" },
  openings: { uz: "Deraza va tashqi eshiklar", ru: "Окна и наружные двери" },
  engineering: { uz: "Muhandislik tarmoqlari", ru: "Инженерные сети" },
  rough: { uz: "Qoralama pardoz", ru: "Черновая отделка" },
  facade: { uz: "Fasad", ru: "Фасад" },
  finishing: { uz: "Toza pardoz", ru: "Чистовая отделка" },
  yard: { uz: "Hovli", ru: "Двор" },
  extra: { uz: "Yetkazish va zaxira", ru: "Доставка и резерв" },
};

export interface Line {
  id: string;
  label: L;
  qty: number;
  unit: L;
  unitUzs: number;
  totalUzs: number;
  kind: PriceKind | "other";
  source: PriceSource;
}

export interface Stage {
  id: StageId;
  label: L;
  lines: Line[];
  totalUzs: number;
}

export interface CostResult {
  stages: Stage[];
  materialsUzs: number;
  labourUzs: number;
  /** Lines priced with the work included (windows with fitting, facade packages…). */
  bothUzs: number;
  totalUzs: number;
  perM2Uzs: number;
  /** ±15 %: what a real quote usually lands in. */
  lowUzs: number;
  highUzs: number;
  geometry: { footprint: number; perimeter: number; storeyHeight: number; windowsM2: number; bathrooms: number };
}

// ── Rules of thumb ────────────────────────────────────────────────
/** Outer-wall length ≈ 4.4 × √footprint (a square is 4.0; real plans have bays and corners). */
const PERIMETER_FACTOR = 4.4;
/** Clear storey height plus slab, m. Classic houses are taller. */
const STOREY_HEIGHT: Record<Style, number> = { modern: 3.0, neoclassic: 3.2, classic: 3.3 };
/** Window m² per m² of floor. Modern houses have more glass. */
const WINDOW_SHARE: Record<Style, number> = { modern: 0.17, neoclassic: 0.14, classic: 0.13 };
/** Panoramic (modern) and arched (classic) windows cost more per m². */
const WINDOW_PRICE_FACTOR: Record<Style, number> = { modern: 1.15, neoclassic: 1, classic: 1.2 };
/** An attic floor (the ".5") counts as 60 % of a full floor when sizing the footprint. */
const ATTIC_SHARE = 0.6;
/** Wall thickness, m: 1.5 bricks outside / 1 brick inside; 30 / 20 cm gas block. */
const WALL_THICKNESS: Record<Walls, { outer: number; inner: number }> = {
  brick: { outer: 0.38, inner: 0.25 },
  gasblock: { outer: 0.3, inner: 0.2 },
};
/** Inner walls ≈ 0.9 × the outer perimeter per floor; 15 % of them is doorways. */
const INNER_WALL_FACTOR = 0.9;
const INNER_OPENINGS = 0.15;
/** 400 bricks per m³ of masonry + 5 % breakage. */
const BRICKS_PER_M3 = 420;
/** One 600×300×200 block is 0.036 m³; + 5 % breakage. */
const BLOCKS_PER_M3 = (1 / 0.036) * 1.05;
/** m³ of mortar per m³ of wall (thin glue joints for gas block). Shared with the material calculators. */
export const MORTAR_PER_M3: Record<Walls, number> = { brick: 0.24, gasblock: 0.08 };
/** 1 m³ of M100 mortar (1:4): 6 bags of cement, 1.1 m³ of sand. */
export const CEMENT_BAGS_PER_M3 = 6;
export const SAND_PER_M3 = 1.1;
/** Strip foundation under outer and bearing inner walls: 1.6 × perimeter, 0.6 m wide,
 *  1.2 m deep for one floor and 15 cm deeper for every floor above. */
const FOUNDATION_LENGTH = 1.6;
const foundationSection = (fullFloors: number) => 0.6 * (1.2 + 0.15 * (fullFloors - 1));
/** Seismic belt on every floor (0.4 × 0.3 m over the foundation length) + cores: 0.025 m³ per m². */
const BELT_SECTION = 0.4 * 0.3;
const COLUMNS_PER_M2 = 0.025;
/** Monolithic slab 20 cm, 5 % wider than the footprint (balconies, overhangs). */
const SLAB_THICKNESS = 0.2;
const SLAB_OVERHANG = 1.05;
/** One concrete stair flight ≈ 2.5 m³. */
const STAIR_M3 = 2.5;
/** Rebar, kg per m³ of concrete. */
export const REBAR_KG = { foundation: 45, frame: 120, slab: 100, basement: 90 };
/** Pitched roof area = 1.4 × footprint (slope + eaves); timber 0.03 m³ per m² of roof. */
const PITCHED_ROOF_FACTOR = 1.4;
const TIMBER_PER_M2 = 0.03;
/** One wet room (bathroom or kitchen) per 55 m²; one inner door per 14 m². */
const M2_PER_WET_ROOM = 55;
const M2_PER_DOOR = 14;
/** Yard paths cover 35 % of the free plot. */
const PAVED_SHARE = 0.35;
/** Delivery of materials: 3 %. Reserve for the unexpected: 10 % (builders advise 10–20 %). */
const DELIVERY = 0.03;
const RESERVE = 0.1;
export const RANGE = 0.15;

/** 62.4000001 → 62.4; whole numbers from 100 up. */
const roundQty = (n: number) => (n >= 100 ? Math.round(n) : Math.round(n * 10) / 10);

export function computeCost(input: CostInput): CostResult {
  const area = Math.max(20, Math.min(2000, input.area));
  const fullFloors = Math.floor(input.floors);
  const attic = input.floors % 1 !== 0;
  const footprint = area / (fullFloors + (attic ? ATTIC_SHARE : 0));
  const perimeter = PERIMETER_FACTOR * Math.sqrt(footprint);
  const storeyHeight = STOREY_HEIGHT[input.style];
  const level = { rough: input.finish !== "shell", turnkey: input.finish === "turnkey" };

  const stages = new Map<StageId, Line[]>();
  const add = (stage: StageId, id: PriceId, qty: number, unitUzs?: number) => {
    if (!(qty > 0)) return;
    const price = PRICES[id];
    const unit = unitUzs ?? price.uzs;
    const line: Line = {
      id, label: price.label, qty: roundQty(qty), unit: price.unit,
      unitUzs: unit, totalUzs: qty * unit, kind: price.kind as PriceKind, source: price.source,
    };
    stages.set(stage, [...(stages.get(stage) ?? []), line]);
  };

  // ── Foundation ──
  const foundationLength = FOUNDATION_LENGTH * perimeter;
  const foundationM3 = foundationLength * foundationSection(fullFloors);
  const groundSlabM3 = footprint * 0.1;
  add("foundation", "excavation", foundationLength * 0.8 * 1.2);
  add("foundation", "gravel", footprint * 0.2);
  add("foundation", "concreteM250", foundationM3 + groundSlabM3);
  add("foundation", "rebar", ((foundationM3 + groundSlabM3) * REBAR_KG.foundation) / 1000);
  add("foundation", "formwork", foundationLength * 1.0);
  add("foundation", "waterproofing", foundationLength * 1.2);
  add("foundation", "concreteWork", foundationM3 + groundSlabM3);

  // ── Basement ──
  if (input.basement) {
    const basementM3 = perimeter * 2.8 * 0.3 + footprint * 0.15;
    add("basement", "excavation", footprint * 3);
    add("basement", "concreteM300", basementM3);
    add("basement", "rebar", (basementM3 * REBAR_KG.basement) / 1000);
    add("basement", "formwork", perimeter * 2.8 * 2);
    add("basement", "waterproofing", perimeter * 2.8 + footprint);
    add("basement", "concreteWork", basementM3);
  }

  // ── Walls and seismic frame ──
  const windowsM2 = area * WINDOW_SHARE[input.style];
  const outerGross = perimeter * storeyHeight * fullFloors + (attic ? perimeter * 1.2 : 0) + (input.roof === "flat" ? perimeter * 0.8 : 0);
  const outerNet = Math.max(0, outerGross - windowsM2 - 2 * 2.4);
  const innerNet = INNER_WALL_FACTOR * perimeter * storeyHeight * fullFloors * (1 - INNER_OPENINGS) + (attic ? 0.5 * perimeter * 2.4 : 0);
  const thickness = WALL_THICKNESS[input.walls];
  const masonryM3 = outerNet * thickness.outer + innerNet * thickness.inner;
  const mortarM3 = masonryM3 * MORTAR_PER_M3[input.walls];
  if (input.walls === "brick") {
    const bricks = masonryM3 * BRICKS_PER_M3;
    add("walls", "brick", bricks);
    add("walls", "cement", mortarM3 * CEMENT_BAGS_PER_M3);
    add("walls", "sand", mortarM3 * SAND_PER_M3);
    add("walls", "bricklaying", bricks);
  } else {
    const blocks = masonryM3 * BLOCKS_PER_M3;
    add("walls", "gasblock", blocks);
    add("walls", "cement", mortarM3 * CEMENT_BAGS_PER_M3);
    add("walls", "sand", mortarM3 * SAND_PER_M3);
    add("walls", "blocklaying", blocks);
  }
  const frameM3 = foundationLength * BELT_SECTION * fullFloors + area * COLUMNS_PER_M2;
  add("walls", "concreteM300", frameM3);
  add("walls", "rebar", (frameM3 * REBAR_KG.frame) / 1000);
  add("walls", "frameWork", frameM3);

  // ── Slabs and stairs ──
  const slabArea = footprint * SLAB_OVERHANG;
  const flights = Math.ceil(input.floors) - 1 + (input.basement ? 1 : 0);
  const slabM3 = slabArea * SLAB_THICKNESS * fullFloors + flights * STAIR_M3;
  add("slabs", "concreteM300", slabM3);
  add("slabs", "rebar", (slabM3 * REBAR_KG.slab) / 1000);
  add("slabs", "formworkRent", slabArea * fullFloors);
  add("slabs", "frameWork", slabM3);

  // ── Roof ──
  if (input.roof === "pitched") {
    const roofM2 = footprint * PITCHED_ROOF_FACTOR;
    add("roof", "timber", roofM2 * TIMBER_PER_M2);
    add("roof", "roofTile", roofM2);
    add("roof", "roofInsulation", attic ? roofM2 : footprint);
    add("roof", "gutter", perimeter * 1.1);
    add("roof", "roofWork", roofM2);
  } else {
    const roofM2 = footprint * 1.05;
    add("roof", "flatRoof", roofM2);
    add("roof", "gutter", perimeter * 0.5);
    add("roof", "roofWork", roofM2);
  }

  // ── Windows and outer doors ──
  add("openings", "window", windowsM2, PRICES.window.uzs * WINDOW_PRICE_FACTOR[input.style]);
  add("openings", "entranceDoor", 1);
  add("openings", "backDoor", 1);

  // ── Engineering, rough finish, facade ──
  const wetRooms = Math.max(2, Math.round(area / M2_PER_WET_ROOM));
  const bathrooms = wetRooms - 1;
  const innerSurfaces = outerNet + 2 * innerNet;
  if (level.rough) {
    add("engineering", "electrics", area);
    add("engineering", "wetRoom", wetRooms);
    add("engineering", "utilities", 1);
    add("engineering", "boiler", 1);
    add("engineering", "heating", area);

    add("rough", "plaster", innerSurfaces + area);
    add("rough", "plasterWork", innerSurfaces);
    add("rough", "ceilingWork", area);
    add("rough", "screed", area + (input.basement ? footprint : 0));
    add("rough", "screedWork", area + (input.basement ? footprint : 0));

    const facadeId: PriceId = input.style === "modern" ? "facadeModern" : input.style === "neoclassic" ? "facadeNeoclassic" : "facadeClassic";
    add("facade", facadeId, outerNet);
  }

  // ── Clean finish ──
  if (level.turnkey) {
    add("finishing", "floorFinish", area);
    add("finishing", "floorWork", area);
    add("finishing", "paint", innerSurfaces);
    add("finishing", "paintWork", innerSurfaces);
    add("finishing", "ceiling", area, PRICES.ceiling.uzs * (input.style === "classic" ? 1.3 : 1));
    add("finishing", "bathroom", bathrooms);
    add("finishing", "interiorDoor", Math.round(area / M2_PER_DOOR));
    add("finishing", "stairFinish", flights);
  }

  // ── Yard ──
  const plotM2 = Math.max(0, input.plotSotix) * 100;
  if (input.fence && plotM2 > 0) {
    add("yard", "fence", 4 * Math.sqrt(plotM2));
    add("yard", "gate", 1);
  }
  if (input.paving && plotM2 > footprint) add("yard", "paving", (plotM2 - footprint) * PAVED_SHARE);

  // ── Totals ──
  const built: Stage[] = [...stages].map(([id, lines]) => ({
    id, label: STAGES[id], lines, totalUzs: lines.reduce((sum, line) => sum + line.totalUzs, 0),
  }));
  const materialsUzs = sum(built, "material");
  const labourUzs = sum(built, "labour");
  const bothUzs = sum(built, "both");
  const delivery = materialsUzs * DELIVERY;
  const reserve = (materialsUzs + labourUzs + bothUzs + delivery) * RESERVE;
  built.push({
    id: "extra",
    label: STAGES.extra,
    lines: [
      other("delivery", { uz: "Materiallarni yetkazish (3 %)", ru: "Доставка материалов (3 %)" }, delivery),
      other("reserve", { uz: "Kutilmagan xarajatlar uchun zaxira (10 %)", ru: "Резерв на непредвиденное (10 %)" }, reserve),
    ],
    totalUzs: delivery + reserve,
  });
  const subtotal = materialsUzs + labourUzs + bothUzs;
  const totalUzs = subtotal + delivery + reserve;
  // The fence and yard paths aren't the house: leave them (and their share of
  // delivery and reserve) out of the price per m².
  const yardUzs = built.find((stage) => stage.id === "yard")?.totalUzs ?? 0;
  const houseUzs = subtotal > 0 ? totalUzs * (1 - yardUzs / subtotal) : 0;

  return {
    stages: built,
    materialsUzs,
    labourUzs,
    bothUzs,
    totalUzs,
    perM2Uzs: houseUzs / area,
    lowUzs: totalUzs * (1 - RANGE),
    highUzs: totalUzs * (1 + RANGE),
    geometry: { footprint, perimeter, storeyHeight, windowsM2, bathrooms },
  };
}

function sum(stages: Stage[], kind: PriceKind) {
  return stages.reduce((total, stage) => total + stage.lines.filter((line) => line.kind === kind).reduce((s, line) => s + line.totalUzs, 0), 0);
}

function other(id: string, label: L, totalUzs: number): Line {
  return { id, label, qty: 1, unit: { uz: "", ru: "" }, unitUzs: totalUzs, totalUzs, kind: "other", source: "estimate" };
}

/** Reads the calculator's answers from a page address (?area=180&floors=2&style=classic…). */
export function inputFromParams(params: URLSearchParams | Record<string, string | undefined>): CostInput {
  const get = (key: string) => (params instanceof URLSearchParams ? params.get(key) : params[key]) ?? undefined;
  const pick = <T extends string>(value: string | undefined, options: readonly T[], fallback: T) =>
    options.includes(value as T) ? (value as T) : fallback;
  const area = Number(get("area"));
  const floors = Number(get("floors")) as Floors;
  const plot = Number(get("plot"));
  return {
    ...DEFAULT_INPUT,
    area: area >= 20 && area <= 2000 ? Math.round(area) : DEFAULT_INPUT.area,
    floors: FLOOR_CHOICES.includes(floors) ? floors : DEFAULT_INPUT.floors,
    style: pick(get("style"), ["modern", "neoclassic", "classic"], DEFAULT_INPUT.style),
    walls: pick(get("walls"), ["brick", "gasblock"], DEFAULT_INPUT.walls),
    roof: pick(get("roof"), ["pitched", "flat"], DEFAULT_INPUT.roof),
    finish: pick(get("finish"), ["shell", "rough", "turnkey"], DEFAULT_INPUT.finish),
    basement: get("basement") === "1",
    fence: get("fence") === "1",
    paving: get("paving") === "1",
    plotSotix: plot > 0 && plot <= 100 ? plot : DEFAULT_INPUT.plotSotix,
  };
}

export type SavingId = "walls" | "roof" | "style" | "finishRough" | "finishShell" | "basement";

export interface Saving {
  id: SavingId;
  /** The answers to change. */
  change: Partial<CostInput>;
  savingUzs: number;
}

/**
 * One-answer changes that make the house cheaper, biggest saving first — what
 * the result page offers as "how to lower the price". Only changes worth at
 * least 1 % of the total are listed.
 */
export function cheaperOptions(input: CostInput, limit = 3): Saving[] {
  const total = computeCost(input).totalUzs;
  const candidates: { id: SavingId; change: Partial<CostInput> }[] = [];
  if (input.walls === "brick") candidates.push({ id: "walls", change: { walls: "gasblock" } });
  candidates.push({ id: "roof", change: { roof: input.roof === "pitched" ? "flat" : "pitched" } });
  if (input.style === "classic") candidates.push({ id: "style", change: { style: "neoclassic" } });
  if (input.style === "neoclassic") candidates.push({ id: "style", change: { style: "modern" } });
  if (input.finish === "turnkey") candidates.push({ id: "finishRough", change: { finish: "rough" } });
  if (input.finish === "rough") candidates.push({ id: "finishShell", change: { finish: "shell" } });
  if (input.basement) candidates.push({ id: "basement", change: { basement: false } });
  return candidates
    .map(({ id, change }) => ({ id, change, savingUzs: total - computeCost({ ...input, ...change }).totalUzs }))
    .filter((option) => option.savingUzs > total * 0.01)
    .sort((a, b) => b.savingUzs - a.savingUzs)
    .slice(0, limit);
}
