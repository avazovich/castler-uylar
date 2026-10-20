import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";
import { COST_PARTS, LEVELS, ROOM_TYPES, STYLES } from "../vocab";
import {
  FLOOR_CHOICES,
  parseNumber,
  type AdminHouseInput,
  type AdminHouseRow,
  type AdminPhoto,
  type AdminSettingsInput,
  type SaveResult,
} from "./types";

/** Server-only client with write access (SANITY_API_TOKEN never reaches the browser). */
const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
  perspective: "published",
});

const ID_RE = /^(?!drafts\.)[A-Za-z0-9._-]{1,128}$/;
export const isValidId = (id: string) => ID_RE.test(id);

// ---------- reading ----------

const PHOTO = /* groq */ `{
  _key, hotspot, crop,
  "assetId": asset->_id, "url": asset->url,
  "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height
}`;

interface RawPhoto {
  _key?: string;
  hotspot?: { x: number; y: number };
  crop?: { top: number; bottom: number; left: number; right: number };
  assetId?: string;
  url?: string;
  width?: number;
  height?: number;
}

function toPhoto(raw: RawPhoto | null | undefined, fallbackKey: string): AdminPhoto | null {
  if (!raw?.assetId || !raw.url || !raw.width || !raw.height) return null;
  return {
    key: raw._key ?? fallbackKey,
    assetId: raw.assetId,
    url: raw.url,
    width: raw.width,
    height: raw.height,
    focus: { x: raw.hotspot?.x ?? 0.5, y: raw.hotspot?.y ?? 0.5 },
    ...(raw.crop ? { crop: { top: raw.crop.top, bottom: raw.crop.bottom, left: raw.crop.left, right: raw.crop.right } } : {}),
  };
}

const str = (n: number | null | undefined) => (n == null ? "" : String(n).replace(".", ","));
const priceStr = (n: number | null | undefined) => (n == null ? "" : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " "));

export async function getAdminHouses(): Promise<AdminHouseRow[]> {
  const rows = await writeClient.fetch<
    (Omit<AdminHouseRow, "cover" | "name"> & { name?: { uz?: string }; cover?: RawPhoto })[]
  >(`*[_type == "housePlan"] | order(code desc){
    "id": _id, code, name, priceUzs, totalArea, floors,
    "isSample": coalesce(isSample, false), "featured": coalesce(featured, false),
    "cover": cover${PHOTO}
  }`);
  return rows.map((r) => ({ ...r, name: r.name?.uz, cover: toPhoto(r.cover, "cover") ?? undefined }));
}

export async function nextFreeCode(): Promise<number> {
  const max = await writeClient.fetch<number | null>(`math::max(*[_type == "housePlan"].code)`);
  return (max ?? 100) + 1;
}

export async function getAdminHouse(id: string): Promise<AdminHouseInput | null> {
  if (!isValidId(id)) return null;
  const d = await writeClient.fetch<{
    _id: string;
    code?: number;
    name?: { uz?: string; ru?: string };
    isSample?: boolean;
    featured?: boolean;
    style?: AdminHouseInput["style"];
    priceUzs?: number;
    oldPriceUzs?: number;
    plotSotix?: number;
    minPlotWidth?: number;
    minPlotLength?: number;
    totalArea?: number;
    floors?: number;
    description?: { uz?: string; ru?: string };
    cover?: RawPhoto;
    gallery?: RawPhoto[];
    floorPlans?: { _key: string; level?: string; plan?: RawPhoto; rooms?: { _key: string; type?: string; customName?: { uz?: string; ru?: string }; area?: number }[] }[];
    buildEstimate?: { _key: string; part?: string; customPart?: { uz?: string; ru?: string }; area?: number; costUsd?: number }[];
  } | null>(
    `*[_type == "housePlan" && _id == $id][0]{
      _id, code, name, isSample, featured, style, priceUzs, oldPriceUzs, plotSotix, minPlotWidth, minPlotLength,
      totalArea, floors, description,
      "cover": cover${PHOTO}, "gallery": gallery[]${PHOTO},
      floorPlans[]{ _key, level, "plan": plan${PHOTO}, rooms[]{ _key, type, customName, area } },
      buildEstimate[]{ _key, part, customPart, area, costUsd }
    }`,
    { id },
  );
  if (!d) return null;
  const photos = [toPhoto(d.cover, "cover"), ...(d.gallery ?? []).map((g, i) => toPhoto(g, `g-${i}`))].filter(
    (p): p is AdminPhoto => Boolean(p),
  );
  return {
    id: d._id,
    code: d.code == null ? "" : String(d.code),
    nameUz: d.name?.uz ?? "",
    nameRu: d.name?.ru ?? "",
    isSample: Boolean(d.isSample),
    featured: Boolean(d.featured),
    style: d.style ?? "",
    floors: str(d.floors),
    priceUzs: priceStr(d.priceUzs),
    oldPriceUzs: priceStr(d.oldPriceUzs),
    plotSotix: str(d.plotSotix),
    minPlotWidth: str(d.minPlotWidth),
    minPlotLength: str(d.minPlotLength),
    totalArea: str(d.totalArea),
    descriptionUz: d.description?.uz ?? "",
    descriptionRu: d.description?.ru ?? "",
    photos,
    floorPlans: (d.floorPlans ?? []).map((f) => ({
      key: f._key,
      level: (f.level ?? "") as AdminHouseInput["floorPlans"][number]["level"],
      plan: toPhoto(f.plan, `${f._key}-plan`),
      rooms: (f.rooms ?? []).map((r) => ({
        key: r._key,
        type: (r.type ?? "") as AdminHouseInput["floorPlans"][number]["rooms"][number]["type"],
        customUz: r.customName?.uz ?? "",
        customRu: r.customName?.ru ?? "",
        area: str(r.area),
      })),
    })),
    costs: (d.buildEstimate ?? []).map((c) => ({
      key: c._key,
      part: (c.part ?? "") as AdminHouseInput["costs"][number]["part"],
      customUz: c.customPart?.uz ?? "",
      customRu: c.customPart?.ru ?? "",
      area: str(c.area),
      costUsd: priceStr(c.costUsd),
    })),
  };
}

export async function getAdminSettings(): Promise<AdminSettingsInput> {
  const s = await writeClient.fetch<{
    phone?: string;
    telegram?: string;
    instagram?: string;
    address?: { uz?: string; ru?: string };
    included?: { uz?: string[]; ru?: string[] };
  } | null>(`*[_id == "houseSiteSettings"][0]{ phone, telegram, instagram, address, included }`);
  return {
    phone: s?.phone ?? "",
    telegram: s?.telegram ?? "",
    instagram: s?.instagram ?? "",
    addressUz: s?.address?.uz ?? "",
    addressRu: s?.address?.ru ?? "",
    includedUz: (s?.included?.uz ?? []).join("\n"),
    includedRu: (s?.included?.ru ?? []).join("\n"),
  };
}

// ---------- saving ----------

const image = (p: AdminPhoto, key?: string) => ({
  ...(key ? { _key: key } : {}),
  _type: "image",
  asset: { _type: "reference", _ref: p.assetId },
  hotspot: { _type: "sanity.imageHotspot", x: clamp01(p.focus.x), y: clamp01(p.focus.y), width: 0.5, height: 0.5 },
  crop: { _type: "sanity.imageCrop", ...(p.crop ?? { top: 0, bottom: 0, left: 0, right: 0 }) },
});

const clamp01 = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0.5);
const localized = (type: string, uz: string, ru: string) =>
  uz.trim() || ru.trim() ? { _type: type, uz: uz.trim(), ...(ru.trim() ? { ru: ru.trim() } : {}) } : undefined;
const KEY_RE = /^[A-Za-z0-9_-]{1,40}$/;
const safeKey = (k: string) => (KEY_RE.test(k) ? k : randomUUID().slice(0, 12));

/** Checks every field; returns the Sanity document or the errors to show. */
export async function buildHouseDocument(
  input: AdminHouseInput,
): Promise<{ doc: Record<string, unknown> } | { errors: Record<string, string> }> {
  const e: Record<string, string> = {};
  const num = (field: keyof AdminHouseInput, label: string, opts: { required?: boolean; min?: number; integer?: boolean } = {}) => {
    const n = parseNumber(String(input[field] ?? ""));
    if (n == null) {
      if (opts.required) e[field] = `${label}ni kiriting`;
      return undefined;
    }
    if (Number.isNaN(n) || (opts.min != null && n < opts.min) || (opts.integer && !Number.isInteger(n))) {
      e[field] = `${label} noto'g'ri`;
      return undefined;
    }
    return n;
  };

  const code = num("code", "Katalog raqami", { required: true, min: 1, integer: true });
  const priceUzs = num("priceUzs", "Narx", { required: true, min: 0, integer: true });
  const oldPriceUzs = num("oldPriceUzs", "Eski narx", { min: 0, integer: true });
  const plotSotix = num("plotSotix", "Yer maydoni", { required: true, min: 0.5 });
  const minPlotWidth = num("minPlotWidth", "Yer eni", { min: 1 });
  const minPlotLength = num("minPlotLength", "Yer bo'yi", { min: 1 });
  const totalArea = num("totalArea", "Umumiy maydon", { required: true, min: 10 });
  const floors = FLOOR_CHOICES.includes(input.floors) ? Number(input.floors.replace(",", ".")) : undefined;
  if (floors == null) e.floors = "Qavatlar sonini tanlang";
  if (oldPriceUzs != null && priceUzs != null && oldPriceUzs <= priceUzs) {
    e.oldPriceUzs = "Eski narx joriy narxdan katta bo'lishi kerak";
  }
  if (input.style && !(input.style in STYLES)) e.style = "Uslub noto'g'ri";

  const photos = (input.photos ?? []).filter((p) => p?.assetId);
  if (photos.length === 0) e.photos = "Kamida bitta rasm yuklang";

  const floorPlans = (input.floorPlans ?? []).map((f, i) => {
    if (!f.level || !(f.level in LEVELS)) e[`floor-${f.key}`] = "Qavatni tanlang";
    const rooms = (f.rooms ?? []).map((r) => {
      const area = parseNumber(r.area);
      if (!r.type || !(r.type in ROOM_TYPES)) e[`room-${r.key}`] = "Xona turini tanlang";
      else if (area == null || Number.isNaN(area) || area < 0.5) e[`room-${r.key}`] = "Xona maydonini kiriting";
      return {
        _key: safeKey(r.key),
        _type: "room",
        type: r.type,
        ...(r.type === "other" ? { customName: localized("localizedString", r.customUz, r.customRu) } : {}),
        area: area ?? 0,
      };
    });
    return {
      _key: safeKey(f.key || `floor-${i}`),
      _type: "floorPlan",
      level: f.level,
      ...(f.plan?.assetId ? { plan: image(f.plan) } : {}),
      rooms,
    };
  });

  const buildEstimate = (input.costs ?? []).map((c) => {
    const area = parseNumber(c.area);
    const cost = parseNumber(c.costUsd);
    if (!c.part || !(c.part in COST_PARTS)) e[`cost-${c.key}`] = "Qismni tanlang";
    else if (cost == null || Number.isNaN(cost) || cost < 0) e[`cost-${c.key}`] = "Narxni kiriting (dollarda)";
    else if (area != null && (Number.isNaN(area) || area < 0)) e[`cost-${c.key}`] = "Maydon noto'g'ri";
    return {
      _key: safeKey(c.key),
      _type: "costLine",
      part: c.part,
      ...(c.part === "other" ? { customPart: localized("localizedString", c.customUz, c.customRu) } : {}),
      ...(area != null && !Number.isNaN(area) ? { area } : {}),
      costUsd: cost ?? 0,
    };
  });

  const id = input.id && isValidId(input.id) ? input.id : `housePlan-${randomUUID()}`;
  if (code != null && !e.code) {
    const taken = await writeClient.fetch<number>(
      `count(*[_type == "housePlan" && code == $code && !(_id in [$id, $draftId])])`,
      { code, id, draftId: `drafts.${id}` },
    );
    if (taken > 0) e.code = `№ ${code} boshqa loyihada band`;
  }
  if (Object.keys(e).length) return { errors: e };

  const [cover, ...gallery] = photos;
  const doc: Record<string, unknown> = {
    _id: id,
    _type: "housePlan",
    code,
    isSample: Boolean(input.isSample),
    featured: Boolean(input.featured),
    priceUzs,
    plotSotix,
    totalArea,
    floors,
    cover: image(cover),
    gallery: gallery.map((p) => image(p, safeKey(p.key))),
    floorPlans,
    buildEstimate,
  };
  const name = localized("localizedString", input.nameUz, input.nameRu);
  const description = localized("localizedText", input.descriptionUz, input.descriptionRu);
  if (name) doc.name = name;
  if (description) doc.description = description;
  if (input.style) doc.style = input.style;
  if (oldPriceUzs != null) doc.oldPriceUzs = oldPriceUzs;
  if (minPlotWidth != null) doc.minPlotWidth = minPlotWidth;
  if (minPlotLength != null) doc.minPlotLength = minPlotLength;
  return { doc };
}

export async function writeHouse(doc: Record<string, unknown>): Promise<void> {
  await writeClient.createOrReplace(doc as { _id: string; _type: string });
}

export async function removeHouse(id: string): Promise<void> {
  await writeClient.transaction().delete(id).delete(`drafts.${id}`).commit();
}

export async function writeSettings(input: AdminSettingsInput): Promise<SaveResult> {
  const errors: Record<string, string> = {};
  const phone = input.phone.trim();
  const telegram = input.telegram.trim().replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "");
  const instagram = input.instagram.trim();
  if (!phone) errors.phone = "Telefon raqamini kiriting";
  if (telegram && !/^[A-Za-z0-9_]{4,32}$/.test(telegram)) errors.telegram = "Faqat harf, raqam va _ (masalan: castler_uz)";
  if (instagram && !/^https?:\/\/(www\.)?instagram\.com\/\S+$/.test(instagram)) {
    errors.instagram = "To'liq havola kiriting: https://www.instagram.com/...";
  }
  if (Object.keys(errors).length) return { ok: false, message: "Xatolarni tuzating", errors };

  const lines = (s: string) => s.split("\n").map((l) => l.trim()).filter(Boolean);
  const doc: Record<string, unknown> = { _id: "houseSiteSettings", _type: "houseSiteSettings", phone };
  if (telegram) doc.telegram = telegram;
  if (instagram) doc.instagram = instagram;
  const address = localized("localizedString", input.addressUz, input.addressRu);
  if (address) doc.address = address;
  if (lines(input.includedUz).length || lines(input.includedRu).length) {
    doc.included = { _type: "localizedStringList", uz: lines(input.includedUz), ru: lines(input.includedRu) };
  }
  await writeClient.createOrReplace(doc as { _id: string; _type: string });
  return { ok: true, id: "houseSiteSettings" };
}

export async function uploadPhoto(file: File): Promise<AdminPhoto> {
  const asset = await writeClient.assets.upload("image", Buffer.from(await file.arrayBuffer()), {
    filename: file.name || "photo.jpg",
    contentType: file.type,
  });
  const dims = (asset.metadata as { dimensions?: { width: number; height: number } } | undefined)?.dimensions;
  if (!dims) throw new Error("Sanity did not return image dimensions");
  return {
    key: randomUUID().replace(/-/g, "").slice(0, 12),
    assetId: asset._id,
    url: asset.url,
    width: dims.width,
    height: dims.height,
    focus: { x: 0.5, y: 0.5 },
  };
}
