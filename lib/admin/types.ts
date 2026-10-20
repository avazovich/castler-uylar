/**
 * Shapes the admin forms edit, shared by the browser (forms) and the server
 * (validation + saving). Numbers stay as typed strings until saved, so a
 * half-typed "5," or "6 600 0" never fights the cursor.
 */
import type { CostPart, Level, RoomType, Style } from "../vocab";

export interface AdminPhoto {
  key: string;
  assetId: string;
  url: string;
  width: number;
  height: number;
  /** Subject centre, 0–1 — saved as the image's Sanity hotspot. */
  focus: { x: number; y: number };
  /** Kept untouched from the Studio, if someone cropped there. */
  crop?: { top: number; bottom: number; left: number; right: number };
}

export interface AdminRoom {
  key: string;
  type: RoomType | "";
  customUz: string;
  customRu: string;
  area: string;
}

export interface AdminFloor {
  key: string;
  level: Level | "";
  plan: AdminPhoto | null;
  rooms: AdminRoom[];
}

export interface AdminCost {
  key: string;
  part: CostPart | "";
  customUz: string;
  customRu: string;
  area: string;
  costUsd: string;
}

export interface AdminHouseInput {
  /** Sanity document id; absent for a new house. */
  id?: string;
  code: string;
  nameUz: string;
  nameRu: string;
  isSample: boolean;
  featured: boolean;
  style: Style | "";
  floors: string;
  priceUzs: string;
  oldPriceUzs: string;
  plotSotix: string;
  minPlotWidth: string;
  minPlotLength: string;
  totalArea: string;
  descriptionUz: string;
  descriptionRu: string;
  /** First photo is the cover. */
  photos: AdminPhoto[];
  floorPlans: AdminFloor[];
  costs: AdminCost[];
}

export interface AdminHouseRow {
  id: string;
  code: number;
  name?: string;
  priceUzs?: number;
  totalArea?: number;
  floors?: number;
  isSample: boolean;
  featured: boolean;
  cover?: AdminPhoto;
}

export interface AdminSettingsInput {
  phone: string;
  telegram: string;
  instagram: string;
  addressUz: string;
  addressRu: string;
  /** One item per line. */
  includedUz: string;
  includedRu: string;
}

export type SaveResult =
  | { ok: true; id: string; code?: number }
  | { ok: false; message: string; errors?: Record<string, string> };

/** "6 600 000" → 6600000, "5,4" → 5.4, "" → null, junk → NaN. */
export function parseNumber(raw: string): number | null {
  const t = raw.replace(/[\s ]/g, "").replace(",", ".");
  if (!t) return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
}

/** Keeps digits only and groups them: "6600000" → "6 600 000". */
export function groupDigits(raw: string): string {
  return raw.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function newKey(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
}

export const FLOOR_CHOICES = ["1", "1,5", "2", "2,5", "3"];
