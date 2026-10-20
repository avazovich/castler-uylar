/**
 * Search-engine helpers: absolute URLs + hreflang, generated page wording
 * (titles, descriptions, summaries built from each house's own data, so
 * they are always true), and schema.org JSON-LD builders.
 */
import { routing, type Locale } from "@/i18n/routing";
import { formatNumber } from "./format";
import type { HouseSummary, SiteSettings } from "./houses";
import { MAIN_SITE_URL, SITE_URL } from "./site";
import { ROOM_TYPES, type RoomType, type Style } from "./vocab";

export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

/**
 * Canonical + hreflang for a page that exists in every locale. `path` gives
 * the locale-specific path (collection pages have different slugs per
 * language). x-default points at Uzbek, the site's default.
 */
export function alternates(locale: Locale, path: (l: Locale) => string) {
  return {
    canonical: absoluteUrl(path(locale)),
    languages: {
      ...Object.fromEntries(routing.locales.map((l) => [l, absoluteUrl(path(l))])),
      "x-default": absoluteUrl(path(routing.defaultLocale)),
    },
  };
}

/** Sanity CDN crop around the focal point, for share previews and JSON-LD. */
export function socialImage(img: { url: string; focus: { x: number; y: number } }, w = 1200, h = 630): string {
  const url = new URL(img.url);
  const params = { w: String(w), h: String(h), fit: "crop", crop: "focalpoint", "fp-x": img.focus.x.toFixed(3), "fp-y": img.focus.y.toFixed(3), auto: "format" };
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

// ---------- wording ----------

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Russian plural: 1 спальня, 2 спальни, 5 спален. */
export function ruPlural(n: number, one: string, few: string, many: string): string {
  if (!Number.isInteger(n)) return few;
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
}

/** "2 qavatli uy" / "двухэтажный дом" (and the genitive "двухэтажного дома"). */
export function houseKind(floors: number, locale: Locale, ruCase: "nom" | "gen" = "nom"): string {
  if (locale === "uz") return floors === 1.5 ? "mansardali uy" : `${formatNumber(floors)} qavatli uy`;
  const ru: Record<string, [string, string]> = {
    "1": ["одноэтажный дом", "одноэтажного дома"],
    "1.5": ["дом с мансардой", "дома с мансардой"],
    "2": ["двухэтажный дом", "двухэтажного дома"],
    "3": ["трёхэтажный дом", "трёхэтажного дома"],
  };
  const known = ru[String(floors)];
  if (known) return known[ruCase === "nom" ? 0 : 1];
  return ruCase === "nom" ? `дом в ${formatNumber(floors)} этажа` : `дома в ${formatNumber(floors)} этажа`;
}

const STYLE_PHRASE: Record<Style, { uz: string; ru: string }> = {
  modern: { uz: "zamonaviy", ru: "в современном стиле" },
  neoclassic: { uz: "neoklassik", ru: "в стиле неоклассика" },
  classic: { uz: "klassik", ru: "в классическом стиле" },
};

/** Rooms worth naming in generated text (bedrooms/bathrooms are counted instead). */
const NOTABLE_ROOMS: RoomType[] = [
  "living", "kitchenDining", "kitchen", "dining", "study", "guestRoom", "wardrobe", "terrace", "balcony",
  "summerKitchen", "garage", "pool", "sauna", "gym", "cinema",
];

function houseName(h: Pick<HouseSummary, "name">, locale: Locale) {
  if (!h.name) return undefined;
  return locale === "ru" ? `«${h.name}»` : h.name;
}

/** "Afsona — 2 qavatli uy loyihasi, 420 m²" / "«Афсона» — проект двухэтажного дома, 420 м²" */
export function houseTitle(h: HouseSummary, locale: Locale): string {
  const area = formatNumber(h.totalArea);
  const name = houseName(h, locale);
  if (locale === "ru") {
    const kind = houseKind(h.floors, "ru", "gen");
    return name ? `${name} — проект ${kind}, ${area} м²` : `Проект ${kind} № ${h.code}, ${area} м²`;
  }
  const kind = houseKind(h.floors, "uz");
  return name ? `${name} — ${kind} loyihasi, ${area} m²` : `${cap(kind)} loyihasi № ${h.code}, ${area} m²`;
}

/** Adds the closing phrase only while the description stays within what Google shows (~160 chars). */
const fit = (text: string, tail: string) => (text.length + tail.length <= 160 ? text + tail : text);

/** Meta description (≈150 characters) assembled from the house's data. */
export function houseDescription(h: HouseSummary, locale: Locale): string {
  const area = formatNumber(h.totalArea);
  const plot = formatNumber(h.plotSotix);
  const price = formatNumber(h.priceUzs);
  const name = houseName(h, locale);
  if (locale === "ru") {
    const parts = [
      `${name ? `${name} — ` : ""}проект ${houseKind(h.floors, "ru", "gen")}${h.style ? ` ${STYLE_PHRASE[h.style].ru}` : ""}: ${area} м²`,
      h.bedrooms ? `${h.bedrooms} ${ruPlural(h.bedrooms, "спальня", "спальни", "спален")}` : null,
      h.bathrooms ? `${h.bathrooms} ${ruPlural(h.bathrooms, "санузел", "санузла", "санузлов")}` : null,
    ].filter(Boolean);
    const plotWord = ruPlural(h.plotSotix, "сотки", "соток", "соток");
    return fit(`${parts.join(", ")}. Для участка от ${plot} ${plotWord}${h.minPlotWidth ? ` шириной от ${formatNumber(h.minPlotWidth)} м` : ""}. Цена ${price} сум.`, " Планировки и фото.");
  }
  const parts = [
    `${name ? `${name} — ` : ""}${(name ? (x: string) => x : cap)(`${h.style ? `${STYLE_PHRASE[h.style].uz} ` : ""}${houseKind(h.floors, "uz")} loyihasi`)}: ${area} m²`,
    h.bedrooms ? `${h.bedrooms} ta yotoqxona` : null,
    h.bathrooms ? `${h.bathrooms} ta sanuzel` : null,
  ].filter(Boolean);
  return fit(`${parts.join(", ")}. ${plot} sotix${h.minPlotWidth ? ` va ${formatNumber(h.minPlotWidth)} m enli` : ""} yer uchun. Narxi ${price} so'm.`, " Rejalar va rasmlar.");
}

/** Visible "in short" paragraph on the house page — true by construction. */
export function houseSummary(h: HouseSummary, locale: Locale): string {
  const area = formatNumber(h.totalArea);
  const plot = formatNumber(h.plotSotix);
  const name = houseName(h, locale);
  const rooms = NOTABLE_ROOMS.filter((r) => h.roomTypes.includes(r)).map((r) => ROOM_TYPES[r][locale].toLowerCase());
  const join = (list: string[], and: string) =>
    list.length <= 1 ? list.join("") : `${list.slice(0, -1).join(", ")} ${and} ${list[list.length - 1]}`;

  if (locale === "ru") {
    const s = [
      `${name ? `${name} — п` : "П"}роект ${houseKind(h.floors, "ru", "gen")}${h.style ? ` ${STYLE_PHRASE[h.style].ru}` : ""}.`,
      `Общая площадь — ${area} м².`,
      `Дом помещается на участке от ${plot} ${ruPlural(h.plotSotix, "сотки", "соток", "соток")}${h.minPlotWidth ? `, ширина участка — от ${formatNumber(h.minPlotWidth)} м` : ""}.`,
    ];
    if (h.bedrooms || h.bathrooms || rooms.length) {
      const counts = [
        h.bedrooms ? `${h.bedrooms} ${ruPlural(h.bedrooms, "спальня", "спальни", "спален")}` : null,
        h.bathrooms ? `${h.bathrooms} ${ruPlural(h.bathrooms, "санузел", "санузла", "санузлов")}` : null,
      ].filter((x): x is string => Boolean(x));
      s.push(`В планировке ${[join(counts, "и"), rooms.length ? `${counts.length ? "а также " : ""}${join(rooms, "и")}` : ""].filter(Boolean).join(", ")}.`);
    }
    return s.join(" ");
  }
  const s = [
    `${name ? `${name} — ` : ""}${(name ? (x: string) => x : cap)(`${h.style ? `${STYLE_PHRASE[h.style].uz} ` : ""}${houseKind(h.floors, "uz")} loyihasi`)}.`,
    `Umumiy maydoni ${area} m².`,
    `Uy ${plot} sotixli yerga sig'adi${h.minPlotWidth ? `, yer eni kamida ${formatNumber(h.minPlotWidth)} m bo'lishi kerak` : ""}.`,
  ];
  if (h.bedrooms || h.bathrooms || rooms.length) {
    const counts = [h.bedrooms ? `${h.bedrooms} ta yotoqxona` : null, h.bathrooms ? `${h.bathrooms} ta sanuzel` : null].filter(
      (x): x is string => Boolean(x),
    );
    s.push(`Rejada ${[join(counts, "va"), rooms.length ? `${counts.length ? "shuningdek " : ""}${join(rooms, "va")}` : ""].filter(Boolean).join(", ")} bor.`);
  }
  return s.join(" ");
}

/** Image alt text: "Afsona — 2 qavatli uy loyihasi" (+ " — 3-rasm"). */
export function houseAlt(h: Pick<HouseSummary, "name" | "code" | "floors">, locale: Locale, n?: number): string {
  const base =
    locale === "ru"
      ? `${h.name ? `«${h.name}» — ` : ""}проект ${houseKind(h.floors, "ru", "gen")}${h.name ? "" : ` № ${h.code}`}`
      : `${h.name ? `${h.name} — ` : ""}${houseKind(h.floors, "uz")} loyihasi${h.name ? "" : ` № ${h.code}`}`;
  if (!n) return base;
  return locale === "ru" ? `${base} — фото ${n}` : `${base} — ${n}-rasm`;
}

// ---------- JSON-LD ----------

const ORG_ID = `${SITE_URL}/#organization`;

export function organizationLd(settings: SiteSettings, locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Castler",
    url: absoluteUrl(`/${locale}`),
    logo: absoluteUrl("/brand/wordmark-ink.png"),
    sameAs: [MAIN_SITE_URL, settings.instagram ?? "https://www.instagram.com/castler.uz"],
    telephone: settings.phone,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings.phone,
      contactType: "sales",
      availableLanguage: ["uz", "ru"],
    },
    ...(settings.address ? { address: { "@type": "PostalAddress", streetAddress: settings.address, addressCountry: "UZ" } } : {}),
  };
}

export function websiteLd(locale: Locale, name: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name,
    url: absoluteUrl(`/${locale}`),
    inLanguage: locale,
    publisher: { "@id": ORG_ID },
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absoluteUrl(it.path) })),
  };
}

export function itemListLd(locale: Locale, houses: HouseSummary[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: houses.length,
    itemListElement: houses.map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(`/${locale}/loyihalar/${h.code}`),
      name: houseTitle(h, locale),
    })),
  };
}

export function productLd(
  h: HouseSummary,
  locale: Locale,
  images: { url: string; focus: { x: number; y: number } }[],
  description: string,
) {
  const label = (uz: string, ru: string) => (locale === "ru" ? ru : uz);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: houseTitle(h, locale),
    sku: String(h.code),
    category: label("Tayyor uy loyihasi", "Готовый проект дома"),
    description,
    image: images.slice(0, 6).map((img) => socialImage(img, 1200, 900)),
    brand: { "@type": "Brand", name: "Castler" },
    additionalProperty: [
      { "@type": "PropertyValue", name: label("Umumiy maydon", "Общая площадь"), value: h.totalArea, unitCode: "MTK" },
      { "@type": "PropertyValue", name: label("Qavatlar", "Этажность"), value: h.floors },
      { "@type": "PropertyValue", name: label("Yer maydoni (sotix)", "Площадь участка (сотки)"), value: h.plotSotix },
      ...(h.minPlotWidth ? [{ "@type": "PropertyValue", name: label("Yer eni", "Ширина участка"), value: h.minPlotWidth, unitCode: "MTR" }] : []),
      ...(h.bedrooms ? [{ "@type": "PropertyValue", name: label("Yotoqxonalar", "Спальни"), value: h.bedrooms }] : []),
      ...(h.bathrooms ? [{ "@type": "PropertyValue", name: label("Sanuzellar", "Санузлы"), value: h.bathrooms }] : []),
    ],
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/${locale}/loyihalar/${h.code}`),
      priceCurrency: "UZS",
      price: h.priceUzs,
      availability: "https://schema.org/InStock",
      seller: { "@id": ORG_ID },
    },
  };
}
