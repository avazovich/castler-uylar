/**
 * One-time setup: creates 10 SAMPLE house plans (isSample = true, so the
 * site shows a "Namuna" badge) from Castler's past residential projects,
 * reusing the photos already uploaded to Sanity for castler.uz. Sizes,
 * rooms and prices are placeholders for the team to replace in /studio.
 *
 * Also creates the "Site settings" document with the castler.uz phone.
 *
 * Safe to re-run: existing documents are left alone (the team may have
 * edited them). Pass --force to overwrite the sample houses.
 *
 * Each photo carries a hand-picked focal point (the editor's "hotspot") so
 * the site's crops centre on the house. --focus-only re-applies just the
 * photos and focal points to sample houses nobody has edited since.
 *
 *   node --env-file=.env.local scripts/seed-sample-houses.mjs [--force | --focus-only]
 */
import { createClient } from "@sanity/client";

const force = process.argv.includes("--force");
const focusOnly = process.argv.includes("--focus-only");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2025-01-01",
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

// Photos are [pick, focusX, focusY]: pick "m" is the castler.uz project's
// main photo, a number is its gallery position; focus is the subject's
// centre (0–1 across, 0–1 down), read off each photo by eye.
const HOUSES = [
  {
    code: 110, slug: "afsona-villa", cover: ["m", 0.52, 0.7],
    gallery: [[0, 0.5, 0.52], [1, 0.5, 0.62], [6, 0.48, 0.7], [7, 0.5, 0.6], [8, 0.5, 0.65], [4, 0.5, 0.72]],
    name: { uz: "Afsona", ru: "Афсона" }, style: "modern", featured: true, floors: 2,
    plotSotix: 10, minPlotWidth: 24, minPlotLength: 42, totalArea: 420, priceUzs: 18_500_000, oldPriceUzs: 32_000_000,
    extras: { ground: [["pool", 40], ["sauna", 6], ["shower", 4]] }, pool: true,
    description: {
      uz: "Suzish havzasi atrofida qurilgan, to'q rangli shifer va travertin bilan qoplangan villa. Keng oynali fasad, yog'och va tosh uyg'unligi.",
      ru: "Вилла из тёмного сланца и травертина вокруг бассейна. Панорамное остекление, сочетание дерева и камня.",
    },
  },
  {
    code: 109, slug: "chortoq-estate", cover: [2, 0.5, 0.58],
    gallery: [["m", 0.5, 0.47], [1, 0.5, 0.5], [6, 0.5, 0.5], [7, 0.5, 0.58], [3, 0.5, 0.6], [4, 0.5, 0.6]],
    name: { uz: "Chortoq", ru: "Чартак" }, style: "neoclassic", featured: true, floors: 1,
    plotSotix: 8, minPlotWidth: 22, minPlotLength: 36, totalArea: 310, priceUzs: 14_000_000, oldPriceUzs: 24_000_000,
    description: {
      uz: "Simmetrik kompozitsiya, baland derazalar va nafis bezaklar. Tabiiy tosh fasad va obodonlashtirilgan hovli.",
      ru: "Симметричная композиция, высокие окна и изящный декор. Фасад из натурального камня и благоустроенный двор.",
    },
  },
  {
    code: 108, slug: "toraqorgon-recidence", cover: [4, 0.5, 0.53],
    gallery: [["m", 0.48, 0.65], [2, 0.5, 0.45], [6, 0.5, 0.5], [13, 0.5, 0.38], [15, 0.5, 0.52], [0, 0.5, 0.56]],
    name: { uz: "To'raqo'rg'on", ru: "Туракурган" }, style: "neoclassic", featured: true, floors: 1,
    plotSotix: 12, minPlotWidth: 30, minPlotLength: 40, totalArea: 450, priceUzs: 17_000_000, oldPriceUzs: 28_000_000,
    extras: { ground: [["garage", 38]] },
    description: {
      uz: "Muvozanatli proporsiyalar va nafis arxitektura detallariga ega neoklassik uy, ichki hovli atrofida joylashgan.",
      ru: "Неоклассический дом с выверенными пропорциями и изящными деталями, построенный вокруг внутреннего двора.",
    },
  },
  {
    code: 107, slug: "margilon-residence", cover: ["m", 0.5, 0.55],
    gallery: [[11, 0.5, 0.52], [0, 0.5, 0.55], [3, 0.5, 0.5], [4, 0.5, 0.55], [6, 0.5, 0.52]],
    name: { uz: "Marg'ilon", ru: "Маргилан" }, style: "modern", featured: true, floors: 1,
    plotSotix: 7, minPlotWidth: 20, minPlotLength: 35, totalArea: 290, priceUzs: 12_000_000, oldPriceUzs: 20_000_000,
    extras: { ground: [["garage", 36]] },
    description: {
      uz: "Travertin bilan qoplangan uy: o'ymakor yog'och eshik, karniz yoritgichlari va yapon zarang daraxtlari bilan bezatilgan kirish qismi.",
      ru: "Дом из травертина: резная деревянная дверь, подсветка карниза и японские клёны у входа.",
    },
  },
  {
    code: 106, slug: "mingchinor-residence", cover: [3, 0.5, 0.55],
    gallery: [["m", 0.5, 0.48], [4, 0.5, 0.6], [5, 0.5, 0.6], [1, 0.5, 0.52], [2, 0.5, 0.55]],
    name: { uz: "Mingchinor", ru: "Мингчинор" }, style: "modern", featured: true, floors: 2,
    plotSotix: 5, minPlotWidth: 16, minPlotLength: 32, totalArea: 360, priceUzs: 13_500_000,
    extras: { ground: [["garage", 36]] },
    description: {
      uz: "Och rangli tosh va to'q metall uyg'unligidagi ikki qavatli uy. Oynali ikkinchi qavat va yopiq avtoturargoh.",
      ru: "Двухэтажный дом из светлого камня и тёмного металла. Остеклённый второй этаж и крытый навес для машин.",
    },
  },
  {
    code: 105, slug: "gozal-recidence", cover: ["m", 0.5, 0.43],
    gallery: [[1, 0.5, 0.5], [0, 0.5, 0.47], [2, 0.5, 0.48], [4, 0.5, 0.4], [6, 0.5, 0.5], [13, 0.5, 0.5]],
    name: { uz: "Go'zal", ru: "Гузал" }, style: "classic", featured: true, floors: 2,
    plotSotix: 6, minPlotWidth: 18, minPlotLength: 34, totalArea: 480, priceUzs: 16_500_000, oldPriceUzs: 27_000_000,
    description: {
      uz: "Klassik uslubdagi ikki qavatli uy: tabiiy tosh, ustunlar va manzarali hovli.",
      ru: "Двухэтажный дом в классическом стиле: натуральный камень, колонны и ландшафтный двор.",
    },
  },
  {
    code: 104, slug: "navoiy", cover: ["m", 0.52, 0.65],
    gallery: [[2, 0.5, 0.55], [3, 0.5, 0.6], [4, 0.5, 0.58], [7, 0.5, 0.58], [8, 0.5, 0.55], [0, 0.5, 0.62]],
    name: { uz: "Navoiy", ru: "Навои" }, style: "modern", featured: false, floors: 1,
    plotSotix: 9, minPlotWidth: 26, minPlotLength: 35, totalArea: 330, priceUzs: 13_000_000,
    extras: { ground: [["garage", 36]] },
    description: {
      uz: "Pog'onali tosh favvora atrofida qurilgan bir qavatli uy. Yoritilgan karnizlar, sarv daraxtlari va yog'och panelli interyer.",
      ru: "Одноэтажный дом вокруг каскадного каменного фонтана. Подсвеченные карнизы, кипарисы и интерьер с деревянными панелями.",
    },
  },
  {
    code: 103, slug: "mashad", cover: [14, 0.5, 0.6],
    gallery: [[13, 0.5, 0.6], [10, 0.5, 0.6], [15, 0.5, 0.6], [16, 0.5, 0.6], [17, 0.5, 0.6], [18, 0.5, 0.6]],
    name: { uz: "Mashad", ru: "Машад" }, style: "neoclassic", featured: false, floors: 1,
    plotSotix: 8, minPlotWidth: 24, minPlotLength: 33, totalArea: 380, priceUzs: 14_500_000, oldPriceUzs: 24_000_000,
    description: {
      uz: "Arkali ayvonlar va sarv daraxtlari bilan o'ralgan hovliga ega bir qavatli uy.",
      ru: "Одноэтажный дом с арочными галереями и двором, обрамлённым кипарисами.",
    },
  },
  {
    code: 102, slug: "gozal-dacha", cover: [2, 0.5, 0.48],
    gallery: [["m", 0.5, 0.43], [0, 0.5, 0.45], [6, 0.5, 0.6], [1, 0.5, 0.42], [5, 0.5, 0.5], [7, 0.5, 0.45]],
    name: { uz: "Go'zal dacha", ru: "Гузал дача" }, style: "neoclassic", featured: false, floors: 2,
    plotSotix: 6, minPlotWidth: 20, minPlotLength: 30, totalArea: 260, priceUzs: 11_000_000,
    description: {
      uz: "Ustunli ayvon va ichki hovliga ega neoklassik dacha.",
      ru: "Неоклассическая дача с колоннадой и внутренним двором.",
    },
  },
  {
    code: 101, slug: "nanay-dacha", cover: ["m", 0.5, 0.62],
    gallery: [[1, 0.5, 0.52], [3, 0.5, 0.5], [4, 0.5, 0.55], [5, 0.5, 0.42]],
    name: { uz: "Nanay", ru: "Нанай" }, style: "modern", featured: false, floors: 2,
    plotSotix: 4, minPlotWidth: 14, minPlotLength: 28, totalArea: 240, priceUzs: 9_800_000, oldPriceUzs: 16_000_000,
    extras: { ground: [["garage", 30]] },
    description: {
      uz: "Travertin va to'q tosh mo'ri bilan ajralib turuvchi ikki qavatli dacha. Yopiq avtoturargoh va zich ko'kalamzorlashtirilgan hovli.",
      ru: "Двухэтажная дача из травертина с акцентной каменной трубой. Крытый навес для машин и густое озеленение.",
    },
  },
];

// Room templates (m² before scaling to each house's size).
const ONE_FLOOR = {
  ground: [
    ["vestibule", 6], ["hall", 28], ["living", 40], ["kitchenDining", 34], ["masterBedroom", 24], ["wardrobe", 7],
    ["bathroom", 8], ["bedroom", 18], ["kidsBedroom", 17], ["kidsBedroom", 16], ["bathroom", 6], ["laundry", 6],
    ["boiler", 5], ["terrace", 32],
  ],
};
const TWO_FLOORS = {
  ground: [
    ["vestibule", 6], ["hall", 30], ["living", 42], ["kitchenDining", 36], ["guestRoom", 20], ["bathroom", 5],
    ["stairs", 13], ["laundry", 7], ["boiler", 6], ["terrace", 30],
  ],
  second: [
    ["hall", 26], ["stairs", 13], ["masterBedroom", 26], ["wardrobe", 8], ["bathroom", 9], ["kidsBedroom", 19],
    ["kidsBedroom", 18], ["bedroom", 18], ["bathroom", 6], ["balcony", 10],
  ],
};

const round1 = (n) => Math.round(n * 10) / 10;
const key = (...parts) => parts.join("-").replace(/[^a-z0-9-]/gi, "");

function floorPlans(h) {
  const template = h.floors >= 2 ? TWO_FLOORS : ONE_FLOOR;
  const levels = Object.fromEntries(
    Object.entries(template).map(([level, rooms]) => [level, [...rooms, ...(h.extras?.[level] ?? [])]]),
  );
  const base = Object.values(levels).flat().reduce((s, [, a]) => s + a, 0);
  const scale = (h.totalArea * 0.86) / base; // rooms ≈ 86% of gross floor area
  return Object.entries(levels).map(([level, rooms]) => ({
    _key: key(level),
    _type: "floorPlan",
    level,
    rooms: rooms.map(([type, area], i) => ({ _key: key(level, i), _type: "room", type, area: round1(area * scale) })),
  }));
}

function buildEstimate(h) {
  const levels = h.floors >= 2 ? ["ground", "second"] : ["ground"];
  const perFloor = Math.round(h.totalArea / levels.length);
  const roofArea = Math.round(perFloor * 1.25);
  const hundreds = (n) => Math.round(n / 100) * 100;
  return [
    ...levels.map((part) => ({ _key: key(part), _type: "costLine", part, area: perFloor, costUsd: hundreds(perFloor * 85) })),
    { _key: "roof", _type: "costLine", part: "roof", area: roofArea, costUsd: hundreds(roofArea * 22) },
    ...(h.pool ? [{ _key: "pool", _type: "costLine", part: "pool", area: 40, costUsd: 5000 }] : []),
  ];
}

const projects = await client.fetch(
  `*[_type == "project" && slug.current in $slugs]{ "slug": slug.current, "main": image.asset._ref, "gallery": gallery[].asset._ref }`,
  { slugs: HOUSES.map((h) => h.slug) },
);
const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));

function assetRef(slug, [pick]) {
  const p = bySlug[slug];
  if (!p) throw new Error(`castler.uz project "${slug}" not found in Sanity`);
  const id = pick === "m" ? p.main : p.gallery?.[pick];
  if (!id) throw new Error(`"${slug}" has no photo at position ${pick}`);
  return id;
}

const image = (id, [, x, y], k) => ({
  ...(k ? { _key: k } : {}),
  _type: "image",
  asset: { _type: "reference", _ref: id },
  hotspot: { _type: "sanity.imageHotspot", x, y, width: 0.5, height: 0.5 },
  crop: { _type: "sanity.imageCrop", top: 0, bottom: 0, left: 0, right: 0 },
});

const photos = (h) => ({
  cover: image(assetRef(h.slug, h.cover), h.cover),
  gallery: h.gallery.map((g, i) => image(assetRef(h.slug, g), g, key("g", i))),
});

if (focusOnly) {
  for (const h of HOUSES) {
    const id = `housePlan-sample-${h.code}`;
    const doc = await client.getDocument(id);
    const draft = await client.getDocument(`drafts.${id}`);
    if (!doc) {
      console.log(`№ ${h.code}: not found, skipped`);
    } else if (draft || doc._updatedAt !== doc._createdAt) {
      console.log(`№ ${h.code}: edited in the Studio since seeding — left alone`);
    } else {
      // ifRevisionId: refuse if someone saves this house while we run.
      await client.patch(id).ifRevisionId(doc._rev).set(photos(h)).commit();
      console.log(`№ ${h.code}: photos + focal points updated`);
    }
  }
  process.exit(0);
}

const tx = client.transaction();
for (const h of HOUSES) {
  const doc = {
    _id: `housePlan-sample-${h.code}`,
    _type: "housePlan",
    code: h.code,
    name: { _type: "localizedString", ...h.name },
    isSample: true,
    featured: h.featured,
    style: h.style,
    priceUzs: h.priceUzs,
    ...(h.oldPriceUzs ? { oldPriceUzs: h.oldPriceUzs } : {}),
    plotSotix: h.plotSotix,
    minPlotWidth: h.minPlotWidth,
    minPlotLength: h.minPlotLength,
    totalArea: h.totalArea,
    floors: h.floors,
    description: { _type: "localizedText", ...h.description },
    ...photos(h),
    floorPlans: floorPlans(h),
    buildEstimate: buildEstimate(h),
  };
  if (force) tx.createOrReplace(doc);
  else tx.createIfNotExists(doc);
}

tx.createIfNotExists({
  _id: "houseSiteSettings",
  _type: "houseSiteSettings",
  phone: "+998 77 000 16 00",
  instagram: "https://www.instagram.com/castler.uz",
  included: {
    _type: "localizedStringList",
    uz: [
      "Bosh reja va qavatlar rejalari",
      "Fasadlar va qirqimlar",
      "3D vizualizatsiya",
      "Konstruktiv yechimlar: poydevor, karkas, tom",
      "Muhandislik tarmoqlari: elektr, suv, kanalizatsiya, isitish",
      "Materiallar va hajmlar ro'yxati",
    ],
    ru: [
      "Генплан и поэтажные планы",
      "Фасады и разрезы",
      "3D-визуализация",
      "Конструктивные решения: фундамент, каркас, кровля",
      "Инженерные сети: электрика, водоснабжение, канализация, отопление",
      "Спецификация материалов и объёмов",
    ],
  },
});

const res = await tx.commit();
console.log(`Done: ${res.results.length} documents (${force ? "replaced" : "created if missing"}).`);
