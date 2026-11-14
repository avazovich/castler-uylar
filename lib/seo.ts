import type { Metadata } from "next";
/**
 * Search-engine helpers: absolute URLs + hreflang, generated page wording
 * (titles, descriptions, summaries built from each house's own data, so
 * they are always true), and schema.org JSON-LD builders.
 */
import { routing, type Locale } from "@/i18n/routing";
import { formatNumber, formatUsd } from "./format";
import type { House, HouseSummary, SiteSettings } from "./houses";
import { MAIN_SITE_URL, SITE_URL } from "./site";
import { ROOM_TYPES, type RoomType, type Style } from "./vocab";

export const absoluteUrl = (path: string) => `${SITE_URL}${path}`;

// ---------- page addresses ----------

const UZ_STYLE_SLUG: Record<Style, string> = { modern: "zamonaviy", neoclassic: "neoklassik", classic: "klassik" };
const RU_FLOORS_SLUG: Record<string, string> = {
  "1": "odnoetazhnogo-doma",
  "1.5": "doma-s-mansardoy",
  "2": "dvuhetazhnogo-doma",
  "3": "trehetazhnogo-doma",
};

/** "Go'zal" → "gozal": Latin letters and digits only, words joined by "-". */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[ʻʼ'‘’`]/g, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type Addressable = Pick<HouseSummary, "code" | "slugName" | "floors" | "style">;

/** "104-uychi-2-qavatli-klassik-uy-loyihasi" / "104-uychi-proekt-dvuhetazhnogo-doma" — the number keeps it unique,
 *  the words say what people search for. */
export function houseSlug(h: Addressable, locale: Locale): string {
  const name = h.slugName ? slugify(h.slugName) : "";
  const parts =
    locale === "ru"
      ? [String(h.code), name, "proekt", RU_FLOORS_SLUG[String(h.floors)] ?? "doma"]
      : [
          String(h.code),
          name,
          h.floors === 1.5 ? "mansardali" : `${String(h.floors).replace(".", "-")}-qavatli`,
          h.style ? UZ_STYLE_SLUG[h.style] : "",
          "uy-loyihasi",
        ];
  return parts.filter(Boolean).join("-");
}

/** For the locale-aware <Link>: "/loyihalar/104-uychi-…". */
export const housePath = (h: Addressable, locale: Locale) => `/loyihalar/${houseSlug(h, locale)}`;
/** With the language in front: "/uz/loyihalar/104-uychi-…". */
export const houseUrlPath = (h: Addressable, locale: Locale) => `/${locale}${housePath(h, locale)}`;

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

export function pageMetadata(
  locale: Locale,
  path: (language: Locale) => string,
  title: string,
  description: string,
  cover?: { url: string; focus: { x: number; y: number } },
  imageAlt?: string,
): Metadata {
  const image = cover ? socialImage(cover) : absoluteUrl("/brand/social.jpg");
  return {
    title,
    description,
    alternates: alternates(locale, path),
    openGraph: {
      type: "website",
      siteName: "Castler Uylar",
      locale: locale === "ru" ? "ru_UZ" : "uz_UZ",
      alternateLocale: [locale === "ru" ? "uz_UZ" : "ru_UZ"],
      url: absoluteUrl(path(locale)),
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt ?? "Castler Uylar" }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
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

/** "Afsona — 2 qavatli uy loyihasi, 6 sotix, 420 m²" / "«Афсона» — проект двухэтажного дома на 6 соток, 420 м²":
 *  what people search for (floors, plot size) up front. */
export function houseTitle(h: HouseSummary, locale: Locale): string {
  const area = formatNumber(h.totalArea);
  const plot = formatNumber(h.plotSotix);
  const name = houseName(h, locale);
  if (locale === "ru") {
    const kind = houseKind(h.floors, "ru", "gen");
    const onPlot = `на ${plot} ${ruPlural(h.plotSotix, "сотку", "сотки", "соток")}`;
    return name ? `${name} — проект ${kind} ${onPlot}, ${area} м²` : `Проект ${kind} № ${h.code} ${onPlot}, ${area} м²`;
  }
  const kind = houseKind(h.floors, "uz");
  return name ? `${name} — ${kind} loyihasi, ${plot} sotix, ${area} m²` : `${cap(kind)} loyihasi № ${h.code}, ${plot} sotix, ${area} m²`;
}

/** What Google shows of a result: about 60 characters of title, 155 of description. */
const META_DESCRIPTION_MAX = 155;
const META_TITLE_MAX = 56; // before the " | Castler" that every page title ends with

/** The richest wording that still fits; the last (shortest) one if none does. */
function firstFit(candidates: string[], max: number): string {
  return candidates.find((c) => c.length <= max) ?? candidates[candidates.length - 1];
}

/** <title> text for a house page. The H1 keeps the full houseTitle(); this one is trimmed to fit a search result. */
export function houseMetaTitle(h: HouseSummary, locale: Locale): string {
  const area = formatNumber(h.totalArea);
  const plot = formatNumber(h.plotSotix);
  const name = houseName(h, locale);
  if (locale === "ru") {
    const kind = houseKind(h.floors, "ru", "gen");
    const onPlot = `на ${plot} ${ruPlural(h.plotSotix, "сотку", "сотки", "соток")}`;
    return firstFit(
      name
        ? [`${name} — проект ${kind} ${onPlot}, ${area} м²`, `${name} — проект ${kind}, ${area} м²`, `Проект ${name}, ${area} м²`, `Проект ${name}`]
        : [`Проект ${kind} № ${h.code} ${onPlot}, ${area} м²`, `Проект ${kind} № ${h.code}, ${area} м²`, `Проект № ${h.code}, ${area} м²`],
      META_TITLE_MAX,
    );
  }
  const kind = houseKind(h.floors, "uz");
  return firstFit(
    name
      ? [`${name} — ${kind} loyihasi, ${plot} sotix, ${area} m²`, `${name} — ${kind} loyihasi, ${area} m²`, `${name} loyihasi, ${area} m²`, `${name} loyihasi`]
      : [`${cap(kind)} loyihasi № ${h.code}, ${plot} sotix, ${area} m²`, `${cap(kind)} loyihasi № ${h.code}, ${area} m²`, `Uy loyihasi № ${h.code}, ${area} m²`],
    META_TITLE_MAX,
  );
}

/** Meta description, at most 155 characters: the richest version of the house's facts that fits. */
export function houseDescription(h: HouseSummary, locale: Locale): string {
  const area = formatNumber(h.totalArea);
  const plot = formatNumber(h.plotSotix);
  const price = formatNumber(h.priceUzs);
  const name = houseName(h, locale);
  const rooms = (bed?: string, bath?: string) => [bed, bath].filter(Boolean).join(", ");

  if (locale === "ru") {
    const kind = houseKind(h.floors, "ru", "gen");
    const lead = name ? `${name} — проект ${kind}` : `Проект ${kind} № ${h.code}`;
    const bed = h.bedrooms ? `${h.bedrooms} ${ruPlural(h.bedrooms, "спальня", "спальни", "спален")}` : undefined;
    const bath = h.bathrooms ? `${h.bathrooms} ${ruPlural(h.bathrooms, "санузел", "санузла", "санузлов")}` : undefined;
    const plotWord = ruPlural(h.plotSotix, "сотки", "соток", "соток");
    const forPlot = `Для участка от ${plot} ${plotWord}${h.minPlotWidth ? ` шириной от ${formatNumber(h.minPlotWidth)} м` : ""}.`;
    const forPlotShort = `Для участка от ${plot} ${plotWord}.`;
    const cost = `Цена ${price} сум.`;
    return firstFit(
      [
        `${lead}: ${[`${area} м²`, rooms(bed, bath)].filter(Boolean).join(", ")}. ${forPlot} ${cost} Планировки и фото.`,
        `${lead}: ${[`${area} м²`, rooms(bed, bath)].filter(Boolean).join(", ")}. ${forPlot} ${cost}`,
        `${lead}: ${[`${area} м²`, bed].filter(Boolean).join(", ")}. ${forPlotShort} ${cost}`,
        `${lead}: ${area} м². ${forPlotShort} ${cost}`,
        `${lead}: ${area} м². ${cost}`,
      ],
      META_DESCRIPTION_MAX,
    );
  }

  const kind = houseKind(h.floors, "uz");
  const lead = name ? `${name} — ${kind} loyihasi` : `${cap(kind)} loyihasi № ${h.code}`;
  const bed = h.bedrooms ? `${h.bedrooms} ta yotoqxona` : undefined;
  const bath = h.bathrooms ? `${h.bathrooms} ta sanuzel` : undefined;
  const forPlot = `${plot} sotix${h.minPlotWidth ? ` va ${formatNumber(h.minPlotWidth)} m enli` : ""} yer uchun.`;
  const forPlotShort = `${plot} sotix yer uchun.`;
  const cost = `Narxi ${price} so'm.`;
  return firstFit(
    [
      `${lead} (proekti): ${[`${area} m²`, rooms(bed, bath)].filter(Boolean).join(", ")}. ${forPlot} ${cost} Rejalar va rasmlar.`,
      `${lead}: ${[`${area} m²`, rooms(bed, bath)].filter(Boolean).join(", ")}. ${forPlot} ${cost}`,
      `${lead}: ${[`${area} m²`, bed].filter(Boolean).join(", ")}. ${forPlotShort} ${cost}`,
      `${lead}: ${area} m². ${forPlotShort} ${cost}`,
      `${lead}: ${area} m². ${cost}`,
    ],
    META_DESCRIPTION_MAX,
  );
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
      url: absoluteUrl(houseUrlPath(h, locale)),
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
      url: absoluteUrl(houseUrlPath(h, locale)),
      priceCurrency: "UZS",
      price: h.priceUzs,
      availability: "https://schema.org/InStock",
      seller: { "@id": ORG_ID },
    },
  };
}

// ---------- questions people ask ----------

export interface Faq {
  q: string;
  a: string;
}

/** The usual questions about a house, answered only from its own data and the site settings — so always true. */
/** "Bosh reja; fasadlar; 3D vizualizatsiya" — one sentence from the settings list. */
const listed = (items: string[]) => items.map((x, i) => (i ? x.charAt(0).toLowerCase() + x.slice(1) : x)).join("; ");

export function houseFaq(h: House, settings: SiteSettings, locale: Locale): Faq[] {
  const f = formatNumber;
  const ru = locale === "ru";
  const named = h.name ? (ru ? `дома «${h.name}»` : `${h.name} uyi`) : ru ? `дома № ${h.code}` : `№ ${h.code} uy`;
  const basement = h.floorPlans.some((p) => p.level === "basement");
  const rooms = NOTABLE_ROOMS.filter((r) => h.roomTypes.includes(r)).map((r) => ROOM_TYPES[r][locale].toLowerCase());
  const list = (xs: string[], and: string) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} ${and} ${xs[xs.length - 1]}`);
  const cost = h.buildEstimate.reduce((s, c) => s + c.costUsd, 0);
  const out: Faq[] = [];

  if (ru) {
    const plot = `${f(h.plotSotix)} ${ruPlural(h.plotSotix, "сотка", "сотки", "соток")}`;
    out.push({
      q: `Какой участок нужен для ${named}?`,
      a: `Не меньше ${plot} (${f(h.plotSotix * 100)} м²)${h.minPlotWidth ? `: ширина участка — от ${f(h.minPlotWidth)} м${h.minPlotLength ? `, глубина — от ${f(h.minPlotLength)} м` : ""}` : ""}.`,
    });
    const counts = [
      h.bedrooms ? `${h.bedrooms} ${ruPlural(h.bedrooms, "спальня", "спальни", "спален")}` : null,
      h.bathrooms ? `${h.bathrooms} ${ruPlural(h.bathrooms, "санузел", "санузла", "санузлов")}` : null,
    ].filter((x): x is string => Boolean(x));
    out.push({
      q: `Сколько комнат в проекте ${named}?`,
      a: `${cap(list(counts, "и") || "Планировка указана ниже")}${rooms.length ? `, а также ${list(rooms, "и")}` : ""}. Общая площадь — ${f(h.totalArea)} м², ${houseKind(h.floors, "ru")}${basement ? " с цокольным этажом" : ""}.`,
    });
    if (cost > 0)
      out.push({
        q: `Сколько стоит построить коробку ${named}?`,
        a: `По предварительному расчёту — около ${formatUsd(cost)} (${h.buildEstimate.map((c) => `${c.label.toLowerCase()} — ${formatUsd(c.costUsd)}`).join(", ")}). Это расчёт только для коробки; точная сумма зависит от материалов, региона и цен на рынке.`,
      });
    out.push({
      q: "Сколько стоит проект?",
      a: `Проектная документация стоит ${f(h.priceUzs)} сум${h.oldPriceUzs ? ` (прежняя цена — ${f(h.oldPriceUzs)} сум)` : ""}. Строительные работы в цену не входят.`,
    });
    if (settings.included.length)
      out.push({ q: "Что входит в проект?", a: `${listed(settings.included)}.` });
    out.push({
      q: "Как заказать проект?",
      a: `Оставьте имя и телефон через кнопку «Обсудить проект» на этой странице или позвоните по номеру ${settings.phone} — специалист Castler свяжется с вами.`,
    });
    return out;
  }

  out.push({
    q: `${cap(named)}ni qurish uchun qancha yer kerak?`,
    a: `Kamida ${f(h.plotSotix)} sotix (${f(h.plotSotix * 100)} m²) yer kerak${h.minPlotWidth ? `: yer eni kamida ${f(h.minPlotWidth)} m${h.minPlotLength ? `, chuqurligi kamida ${f(h.minPlotLength)} m` : ""}` : ""}.`,
  });
  const counts = [h.bedrooms ? `${h.bedrooms} ta yotoqxona` : null, h.bathrooms ? `${h.bathrooms} ta sanuzel` : null].filter(
    (x): x is string => Boolean(x),
  );
  out.push({
    q: `${cap(named)}da nechta xona bor?`,
    a: `${cap(list(counts, "va") || "Xonalar rejada ko'rsatilgan")}${rooms.length ? `, shuningdek ${list(rooms, "va")}` : ""}. Umumiy maydoni — ${f(h.totalArea)} m², ${houseKind(h.floors, "uz")}${basement ? ", yerto'lasi bor" : ""}.`,
  });
  if (cost > 0)
    out.push({
      q: `${cap(named)}ning karkasini («korobka») qurish qancha turadi?`,
      a: `Taxminiy hisob — ${formatUsd(cost)} atrofida (${h.buildEstimate.map((c) => `${c.label.toLowerCase()} — ${formatUsd(c.costUsd)}`).join(", ")}). Bu faqat karkas uchun; aniq narx materiallar, hudud va bozor narxlariga bog'liq.`,
    });
  out.push({
    q: "Loyiha narxi qancha?",
    a: `Loyiha hujjatlari narxi — ${f(h.priceUzs)} so'm${h.oldPriceUzs ? ` (avvalgi narxi ${f(h.oldPriceUzs)} so'm)` : ""}. Qurilish ishlari narxga kirmaydi.`,
  });
  if (settings.included.length) out.push({ q: "Loyihaga nimalar kiradi?", a: `${listed(settings.included)}.` });
  out.push({
    q: "Loyihani qanday buyurtma qilsa bo'ladi?",
    a: `Shu sahifadagi «Loyihani muhokama qilish» tugmasi orqali ism va telefon raqamingizni qoldiring yoki ${settings.phone} raqamiga qo'ng'iroq qiling — Castler mutaxassisi siz bilan bog'lanadi.`,
  });
  return out;
}

export function faqLd(items: Faq[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })),
  };
}
