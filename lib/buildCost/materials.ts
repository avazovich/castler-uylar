/**
 * Material calculators — brick, gas block and concrete — for the pages people
 * search for («g‘isht hisoblash», «калькулятор газоблока», «beton tarkibini
 * hisoblash»). Same prices (prices.ts) and mortar rules (engine.ts) as the
 * house-cost calculator, so the two never disagree. Pure: numbers in, numbers out.
 */
import { CEMENT_BAGS_PER_M3, MORTAR_PER_M3, REBAR_KG, SAND_PER_M3 } from "./engine";
import { PRICES, type PriceId } from "./prices";

export type MaterialKind = "brick" | "block" | "concrete";

/** One priced line: a material, or the builders' work. */
export interface MaterialLine {
  id: PriceId;
  qty: number;
  unitUzs: number;
  totalUzs: number;
}

export interface MaterialResult {
  /** The headline figure: bricks, blocks or m³ of concrete. */
  main: number;
  lines: MaterialLine[];
  materialsUzs: number;
  labourUzs: number;
  totalUzs: number;
}

const BREAKAGE = 1.05;
const round1 = (n: number) => Math.round(n * 10) / 10;
const line = (id: PriceId, qty: number, unitUzs = PRICES[id].uzs): MaterialLine => ({ id, qty, unitUzs, totalUzs: Math.round(qty * unitUzs) });
function sum(main: number, lines: MaterialLine[]): MaterialResult {
  const kept = lines.filter((l) => l.qty > 0);
  const labourUzs = kept.filter((l) => PRICES[l.id].kind === "labour").reduce((s, l) => s + l.totalUzs, 0);
  const materialsUzs = kept.reduce((s, l) => s + l.totalUzs, 0) - labourUzs;
  return { main, lines: kept, materialsUzs, labourUzs, totalUzs: materialsUzs + labourUzs };
}
const clamp = (n: number, min: number, max: number) => (Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);

// ── Walls ────────────────────────────────────────────────────

/** A wall, or a whole house's outer walls (perimeter × floors × storey height), minus windows and doors. */
export interface WallInput {
  /** Total length of the walls, m. */
  length: number;
  /** Height, m. */
  height: number;
  /** Windows and doors, m². */
  openings: number;
}

/** Floor-to-floor height used for "a whole house", m. */
export const STOREY_M = 3;

/** A house's outer walls as one long wall: 2 × (width + length), floors × 3 m. */
export const houseWalls = (width: number, length: number, floors: number, openings: number): WallInput => ({
  length: 2 * (clamp(width, 0, 200) + clamp(length, 0, 200)),
  height: clamp(floors, 1, 5) * STOREY_M,
  openings,
});

export const wallArea = (w: WallInput) => round1(Math.max(0, clamp(w.length, 0, 2000) * clamp(w.height, 0, 30) - clamp(w.openings, 0, 100_000)));

/** Wall thickness in bricks: half a brick (12 cm) … two bricks (51 cm). */
export type BrickThickness = 0.5 | 1 | 1.5 | 2;
export const BRICK_THICKNESSES: BrickThickness[] = [0.5, 1, 1.5, 2];
/** The standard fired brick, mm (GOST 530, used in Uzbekistan). */
export const BRICK_SIZE = "250 × 120 × 65";
/** Bricks per m² of wall with 10 mm mortar joints — the standard table. */
export const BRICKS_PER_M2: Record<BrickThickness, number> = { 0.5: 51, 1: 102, 1.5: 153, 2: 204 };
/** Wall thickness, m. */
export const BRICK_WALL_M: Record<BrickThickness, number> = { 0.5: 0.12, 1: 0.25, 1.5: 0.38, 2: 0.51 };
/** Bricks in 1 m³ of masonry, joints included (one-brick wall: 102 ÷ 0.25). */
export const BRICKS_PER_M3 = Math.round(BRICKS_PER_M2[1] / BRICK_WALL_M[1]);

export function brickWall(w: WallInput, thickness: BrickThickness): MaterialResult & { area: number; volume: number } {
  const area = wallArea(w);
  const volume = round1(area * BRICK_WALL_M[thickness]);
  const bricks = Math.ceil(area * BRICKS_PER_M2[thickness] * BREAKAGE);
  const mortar = volume * MORTAR_PER_M3.brick;
  return {
    area,
    volume,
    ...sum(bricks, [
      line("brick", bricks),
      line("cement", Math.ceil(mortar * CEMENT_BAGS_PER_M3)),
      line("sand", round1(mortar * SAND_PER_M3)),
      line("bricklaying", bricks),
    ]),
  };
}

/** Gas-block walls: the common 600 × 300 × 200 mm block, laid for a 20 or 30 cm wall. */
export type BlockThickness = 20 | 30;
export const BLOCK_THICKNESSES: BlockThickness[] = [20, 30];
export const BLOCK_SIZE = "600 × 300 × 200";
export const BLOCK_M3 = 0.6 * 0.3 * 0.2;
/** Blocks in 1 m³. */
export const BLOCKS_PER_M3 = 1 / BLOCK_M3;
/** Blocks per m² of wall: a 20 cm wall shows the 600 × 300 face, a 30 cm wall the 600 × 200 face. */
export const BLOCKS_PER_M2: Record<BlockThickness, number> = { 20: 1 / (0.6 * 0.3), 30: 1 / (0.6 * 0.2) };

export function blockWall(w: WallInput, thickness: BlockThickness): MaterialResult & { area: number; volume: number } {
  const area = wallArea(w);
  const volume = round1(area * (thickness / 100));
  const blocks = Math.ceil(area * BLOCKS_PER_M2[thickness] * BREAKAGE);
  const mortar = volume * MORTAR_PER_M3.gasblock;
  return {
    area,
    volume,
    ...sum(blocks, [
      line("gasblock", blocks),
      line("cement", Math.ceil(mortar * CEMENT_BAGS_PER_M3)),
      line("sand", round1(mortar * SAND_PER_M3)),
      line("blocklaying", blocks),
    ]),
  };
}

// ── Concrete ─────────────────────────────────────────────────

export type ConcreteGrade = "M200" | "M250" | "M300";
export const GRADES: ConcreteGrade[] = ["M200", "M250", "M300"];

/**
 * 1 m³ of concrete from M400 cement, by weight cement : sand : gravel — the
 * usual site proportions. Water is cement × water–cement ratio.
 */
export const MIXES: Record<ConcreteGrade, { cementKg: number; sand: number; gravel: number; water: number }> = {
  M200: { cementKg: 290, sand: 2.8, gravel: 4.8, water: 0.6 },
  M250: { cementKg: 330, sand: 2.1, gravel: 3.9, water: 0.55 },
  M300: { cementKg: 380, sand: 1.9, gravel: 3.7, water: 0.5 },
};
const SAND_KG_PER_M3 = 1500;
const GRAVEL_KG_PER_M3 = 1450;
export const CEMENT_BAG_KG = 50;
/** Ready-mixed concrete, where we have a Namangan price. */
const READY: Partial<Record<ConcreteGrade, PriceId>> = { M250: "concreteM250", M300: "concreteM300" };

/** What goes into 1 m³ of a grade. */
export function mixPerM3(grade: ConcreteGrade) {
  const m = MIXES[grade];
  const sandKg = m.cementKg * m.sand;
  const gravelKg = m.cementKg * m.gravel;
  return {
    cementKg: m.cementKg,
    bags: round1(m.cementKg / CEMENT_BAG_KG),
    sandKg: Math.round(sandKg),
    sandM3: Math.round((sandKg / SAND_KG_PER_M3) * 100) / 100,
    gravelKg: Math.round(gravelKg),
    gravelM3: Math.round((gravelKg / GRAVEL_KG_PER_M3) * 100) / 100,
    waterL: Math.round(m.cementKg * m.water),
    ratio: `1 : ${String(m.sand).replace(".", ",")} : ${String(m.gravel).replace(".", ",")}`,
  };
}

export type ConcreteShape = "strip" | "slab";
export interface ConcreteInput {
  shape: ConcreteShape;
  /** strip: total length of the foundation, m; slab: length, m. */
  length: number;
  /** strip: width of the trench, m; slab: width, m. */
  width: number;
  /** strip: depth, m; slab: thickness, m. */
  depth: number;
  grade: ConcreteGrade;
}

/** A strip foundation under a house's outer walls: 2 × (width + length). */
export const housePerimeter = (width: number, length: number) => 2 * (clamp(width, 0, 200) + clamp(length, 0, 200));

export function concrete(input: ConcreteInput) {
  const volume = round1(clamp(input.length, 0, 2000) * clamp(input.width, 0, 200) * clamp(input.depth, 0, 10));
  /** Order a little more: spillage and uneven trenches. */
  const order = round1(volume * 1.05);
  const mix = mixPerM3(input.grade);
  const rebarT = Math.round(order * (input.shape === "strip" ? REBAR_KG.foundation : REBAR_KG.slab)) / 1000;
  const shared = [line("rebar", rebarT), line("concreteWork", order)];
  const readyId = READY[input.grade];
  const ready = readyId ? sum(order, [line(readyId, order), ...shared]) : null;
  const selfMix = sum(order, [
    line("cement", Math.ceil((order * mix.cementKg) / CEMENT_BAG_KG)),
    line("sand", round1(order * mix.sandM3)),
    line("gravel", round1(order * mix.gravelM3)),
    ...shared,
  ]);
  return { volume, order, mix, rebarKg: Math.round(rebarT * 1000), waterL: Math.round(order * mix.waterL), ready, selfMix };
}
