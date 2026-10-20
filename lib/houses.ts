import { cache } from "react";
import type { Locale } from "@/i18n/routing";
import { client } from "@/sanity/lib/client";
import {
  BATHROOM_TYPES,
  BEDROOM_TYPES,
  COST_PARTS,
  LEVELS,
  ROOM_TYPES,
  type CostPart,
  type Level,
  type RoomType,
  type Style,
} from "./vocab";
import { CARD_ASPECT, focusPosition } from "./focus";
import { DEFAULT_PHONE } from "./site";

export { CARD_ASPECT, focusPosition };

export interface Img {
  url: string;
  width: number;
  height: number;
  lqip?: string;
  /** The subject's centre (0–1 across, 0–1 down) — the editor's hotspot,
   *  or the middle of the photo when none is set. */
  focus: { x: number; y: number };
  /** object-position for the site's 4:3 boxes (cards, gallery, thumbnails). */
  position: string;
}


/** Everything a catalog card (and its filters) needs. */
export interface HouseSummary {
  code: number;
  name?: string;
  isSample: boolean;
  featured: boolean;
  style?: Style;
  priceUzs: number;
  oldPriceUzs?: number;
  plotSotix: number;
  minPlotWidth?: number;
  minPlotLength?: number;
  totalArea: number;
  floors: number;
  bedrooms: number;
  bathrooms: number;
  cover: Img;
  /** Derived from the room list — used by the "with pool / garage" pages. */
  features: { pool: boolean; garage: boolean };
  /** Room types in the plan, for generated page text. */
  roomTypes: RoomType[];
  hasCostEstimate: boolean;
  /** ISO time of the last edit, for the sitemap. */
  updatedAt?: string;
}

export interface Floor {
  level: Level;
  label: string;
  plan?: Img;
  rooms: { name: string; area: number }[];
  total: number;
}

export interface House extends HouseSummary {
  description?: string;
  gallery: Img[];
  floorPlans: Floor[];
  buildEstimate: { label: string; area?: number; costUsd: number }[];
}

export interface SiteSettings {
  phone: string;
  telegram?: string;
  instagram?: string;
  address?: string;
  included: string[];
}

type L<T> = { uz?: T; ru?: T } | null | undefined;

const present = (v: unknown) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0);

/** The visitor's language, falling back to Uzbek (the original). */
export function pick<T>(field: L<T>, locale: Locale): T | undefined {
  if (!field) return undefined;
  if (locale === "ru" && present(field.ru)) return field.ru;
  return present(field.uz) ? field.uz : field.ru ?? undefined;
}

const IMG = /* groq */ `{
  "url": asset->url,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  "lqip": asset->metadata.lqip,
  hotspot,
  crop
}`;

const HOUSE = /* groq */ `{
  _updatedAt, code, name, isSample, featured, style, priceUzs, oldPriceUzs,
  plotSotix, minPlotWidth, minPlotLength, totalArea, floors, description,
  "cover": cover${IMG},
  "gallery": gallery[]${IMG},
  "floorPlans": floorPlans[]{ level, "plan": plan${IMG}, rooms[]{ type, customName, area } },
  "buildEstimate": buildEstimate[]{ part, customPart, area, costUsd }
}`;

interface RawImg {
  url?: string;
  width?: number;
  height?: number;
  lqip?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
}

interface RawHouse {
  _updatedAt?: string;
  code: number;
  name?: L<string>;
  isSample?: boolean;
  featured?: boolean;
  style?: Style;
  priceUzs: number;
  oldPriceUzs?: number;
  plotSotix: number;
  minPlotWidth?: number;
  minPlotLength?: number;
  totalArea: number;
  floors: number;
  description?: L<string>;
  cover?: RawImg;
  gallery?: RawImg[] | null;
  floorPlans?: { level: Level; plan?: RawImg; rooms?: { type: RoomType; customName?: L<string>; area: number }[] | null }[] | null;
  buildEstimate?: { part: CostPart; customPart?: L<string>; area?: number; costUsd: number }[] | null;
}

function toImg(raw: RawImg | undefined | null): Img | undefined {
  if (!raw?.url || !raw.width || !raw.height) return undefined;
  let { url, width, height } = raw;
  let fx = raw.hotspot?.x ?? 0.5;
  let fy = raw.hotspot?.y ?? 0.5;

  // Honour a crop drawn in the Studio: serve just that rectangle (Sanity's
  // rect=) and re-express the focal point inside it.
  const c = raw.crop;
  if (c && (c.top > 0 || c.bottom > 0 || c.left > 0 || c.right > 0)) {
    const keepW = 1 - c.left - c.right;
    const keepH = 1 - c.top - c.bottom;
    const rect = [c.left * raw.width, c.top * raw.height, keepW * raw.width, keepH * raw.height].map(Math.round);
    url = `${raw.url}?rect=${rect.join(",")}`;
    width = rect[2];
    height = rect[3];
    fx = Math.min(1, Math.max(0, (fx - c.left) / keepW));
    fy = Math.min(1, Math.max(0, (fy - c.top) / keepH));
  }

  const focus = { x: fx, y: fy };
  return { url, width, height, lqip: raw.lqip, focus, position: focusPosition({ width, height, focus }, CARD_ASPECT) };
}

function toHouse(raw: RawHouse, locale: Locale): House | undefined {
  const cover = toImg(raw.cover);
  // A half-filled draft that was published without its required fields
  // shouldn't break the catalog — skip it until it's complete.
  if (!cover || raw.priceUzs == null || raw.plotSotix == null || raw.totalArea == null || raw.floors == null) {
    return undefined;
  }

  const floorPlans: Floor[] = (raw.floorPlans ?? []).map((f) => {
    const rooms = (f.rooms ?? []).map((r) => ({
      type: r.type,
      name: (r.type === "other" && pick(r.customName, locale)) || ROOM_TYPES[r.type]?.[locale] || "",
      area: r.area,
    }));
    return {
      level: f.level,
      label: LEVELS[f.level]?.[locale] ?? "",
      plan: toImg(f.plan),
      rooms: rooms.map(({ name, area }) => ({ name, area })),
      total: Math.round(rooms.reduce((s, r) => s + (r.area ?? 0), 0) * 10) / 10,
    };
  });

  const allRoomTypes = (raw.floorPlans ?? []).flatMap((f) => (f.rooms ?? []).map((r) => r.type));

  return {
    code: raw.code,
    name: pick(raw.name, locale),
    isSample: Boolean(raw.isSample),
    featured: Boolean(raw.featured),
    style: raw.style,
    priceUzs: raw.priceUzs,
    oldPriceUzs: raw.oldPriceUzs && raw.oldPriceUzs > raw.priceUzs ? raw.oldPriceUzs : undefined,
    plotSotix: raw.plotSotix,
    minPlotWidth: raw.minPlotWidth,
    minPlotLength: raw.minPlotLength,
    totalArea: raw.totalArea,
    floors: raw.floors,
    bedrooms: allRoomTypes.filter((t) => BEDROOM_TYPES.includes(t)).length,
    bathrooms: allRoomTypes.filter((t) => BATHROOM_TYPES.includes(t)).length,
    cover,
    features: { pool: allRoomTypes.includes("pool"), garage: allRoomTypes.includes("garage") },
    roomTypes: [...new Set(allRoomTypes)],
    hasCostEstimate: (raw.buildEstimate ?? []).length > 0,
    updatedAt: raw._updatedAt,
    description: pick(raw.description, locale),
    gallery: (raw.gallery ?? []).map(toImg).filter((i): i is Img => Boolean(i)),
    floorPlans,
    buildEstimate: (raw.buildEstimate ?? []).map((c) => ({
      label: (c.part === "other" && pick(c.customPart, locale)) || COST_PARTS[c.part]?.[locale] || "",
      area: c.area,
      costUsd: c.costUsd,
    })),
  };
}

export function toSummary(h: House): HouseSummary {
  return {
    code: h.code,
    name: h.name,
    isSample: h.isSample,
    featured: h.featured,
    style: h.style,
    priceUzs: h.priceUzs,
    oldPriceUzs: h.oldPriceUzs,
    plotSotix: h.plotSotix,
    minPlotWidth: h.minPlotWidth,
    minPlotLength: h.minPlotLength,
    totalArea: h.totalArea,
    floors: h.floors,
    bedrooms: h.bedrooms,
    bathrooms: h.bathrooms,
    cover: h.cover,
    features: h.features,
    roomTypes: h.roomTypes,
    hasCostEstimate: h.hasCostEstimate,
    updatedAt: h.updatedAt,
  };
}

export const getHouses = cache(async (locale: Locale): Promise<House[]> => {
  const raw = await client.fetch<RawHouse[]>(
    `*[_type == "housePlan" && defined(code)] | order(code desc) ${HOUSE}`,
  );
  return raw.map((r) => toHouse(r, locale)).filter((h): h is House => Boolean(h));
});

export const getHouse = cache(async (code: number, locale: Locale): Promise<House | undefined> => {
  const raw = await client.fetch<RawHouse | null>(
    `*[_type == "housePlan" && code == $code][0] ${HOUSE}`,
    { code },
  );
  return raw ? toHouse(raw, locale) : undefined;
});

export const getSettings = cache(async (locale: Locale): Promise<SiteSettings> => {
  const raw = await client.fetch<{
    phone?: string;
    telegram?: string;
    instagram?: string;
    address?: L<string>;
    included?: L<string[]>;
  } | null>(`*[_id == "houseSiteSettings"][0]{ phone, telegram, instagram, address, included }`);
  return {
    phone: raw?.phone || DEFAULT_PHONE,
    telegram: raw?.telegram || undefined,
    instagram: raw?.instagram || undefined,
    address: pick(raw?.address, locale),
    included: (pick(raw?.included, locale) ?? []).filter((s) => s.trim()),
  };
});
