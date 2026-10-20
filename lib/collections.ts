/**
 * Category landing pages ("1 qavatli uy loyihalari", "проекты домов с
 * гаражом" …): one real, server-rendered URL per common search, with its own
 * heading and intro in each language. A category only exists while at least
 * one house matches it, so there are never empty pages for Google to find.
 */
import type { Locale } from "@/i18n/routing";
import type { HouseSummary } from "./houses";

type L = { uz: string; ru: string };

export interface Collection {
  id: string;
  group: "floors" | "style" | "plot" | "feature";
  slug: L;
  /** Page heading (H1) and link label. */
  title: L;
  /** Short label for chips/links. */
  short: L;
  intro: { uz: string[]; ru: string[] };
  match: (h: HouseSummary) => boolean;
}

const CLOSING: L = {
  uz: "Har bir loyiha sahifasida o'lchamlar, narx va rasmlar bor. Yoqqan loyihani tanlab, raqamingizni qoldiring — mutaxassisimiz bog'lanadi.",
  ru: "На странице каждого проекта — размеры, цена и фото. Выберите понравившийся проект и оставьте номер — наш специалист свяжется с вами.",
};

const plot = (n: number, ruWord: string): Collection => ({
  id: `plot-${n}`,
  group: "plot",
  slug: { uz: `${n}-sotix-uchun-uy-loyihalari`, ru: `proekty-domov-na-${n}-${n === 4 ? "sotki" : "sotok"}` },
  title: { uz: `${n} sotix yer uchun uy loyihalari`, ru: `Проекты домов на ${n} ${ruWord}` },
  short: { uz: `${n} sotixgacha`, ru: `до ${n} соток` }, // "до" takes the genitive: до 4 соток
  intro: {
    uz: [
      `1 sotix — 100 m², demak ${n} sotix — ${n * 100} m² yer. Uy tanlaganda faqat yer maydoniga emas, uning eniga ham qarang: tor yerga kengligi kichikroq loyiha kerak bo'ladi.`,
      `Quyidagi loyihalar ${n} sotixli yerga sig'adi. ${CLOSING.uz}`,
    ],
    ru: [
      `1 сотка — это 100 м², значит ${n} ${ruWord} — ${n * 100} м² земли. Выбирая дом, смотрите не только на площадь участка, но и на его ширину: для узкого участка нужен более узкий проект.`,
      `Проекты ниже помещаются на участке в ${n} ${ruWord}. ${CLOSING.ru}`,
    ],
  },
  match: (h) => h.plotSotix <= n,
});

export const COLLECTIONS: Collection[] = [
  {
    id: "floors-1",
    group: "floors",
    slug: { uz: "1-qavatli-uy-loyihalari", ru: "proekty-odnoetazhnyh-domov" },
    title: { uz: "1 qavatli uy loyihalari", ru: "Проекты одноэтажных домов" },
    short: { uz: "1 qavatli", ru: "Одноэтажные" },
    intro: {
      uz: [
        "Bir qavatli uyda barcha xonalar bir sathda: zinapoya yo'q, keksalar va kichik bolalar uchun qulay, hovliga chiqish oson. Bunday uy kengroq yer talab qiladi, chunki butun maydon bitta qavatga joylashadi.",
        CLOSING.uz,
      ],
      ru: [
        "В одноэтажном доме все помещения на одном уровне: нет лестницы, удобно пожилым и маленьким детям, легко выйти во двор. Такой дом требует участка побольше — вся площадь размещается на одном этаже.",
        CLOSING.ru,
      ],
    },
    match: (h) => h.floors === 1,
  },
  {
    id: "floors-1.5",
    group: "floors",
    slug: { uz: "mansardali-uy-loyihalari", ru: "proekty-domov-s-mansardoy" },
    title: { uz: "Mansardali uy loyihalari", ru: "Проекты домов с мансардой" },
    short: { uz: "Mansardali", ru: "С мансардой" },
    intro: {
      uz: [
        "Mansarda — tom ostidagi yashash qavati. U uyga qo'shimcha xonalar beradi va yer maydonini tejaydi.",
        CLOSING.uz,
      ],
      ru: [
        "Мансарда — жилой этаж под крышей. Она добавляет дому комнаты и экономит площадь участка.",
        CLOSING.ru,
      ],
    },
    match: (h) => h.floors === 1.5,
  },
  {
    id: "floors-2",
    group: "floors",
    slug: { uz: "2-qavatli-uy-loyihalari", ru: "proekty-dvuhetazhnyh-domov" },
    title: { uz: "2 qavatli uy loyihalari", ru: "Проекты двухэтажных домов" },
    short: { uz: "2 qavatli", ru: "Двухэтажные" },
    intro: {
      uz: [
        "Ikki qavatli uy kichikroq yerda katta yashash maydonini beradi. Odatda pastki qavatda mehmonxona, oshxona va mehmonlar xonasi, yuqori qavatda esa yotoqxonalar joylashadi — kunduzgi va tungi zonalar ajraladi.",
        CLOSING.uz,
      ],
      ru: [
        "Двухэтажный дом даёт большую жилую площадь на меньшем участке. Обычно внизу — гостиная, кухня и гостевая комната, наверху — спальни: дневная и ночная зоны разделены.",
        CLOSING.ru,
      ],
    },
    match: (h) => h.floors === 2,
  },
  {
    id: "floors-3",
    group: "floors",
    slug: { uz: "3-qavatli-uy-loyihalari", ru: "proekty-trehetazhnyh-domov" },
    title: { uz: "3 qavatli uy loyihalari", ru: "Проекты трёхэтажных домов" },
    short: { uz: "3 qavatli", ru: "Трёхэтажные" },
    intro: {
      uz: ["Uch qavatli uy tor va kichik yerda ham katta oila uchun yetarli maydon beradi.", CLOSING.uz],
      ru: ["Трёхэтажный дом даёт достаточно площади для большой семьи даже на узком и небольшом участке.", CLOSING.ru],
    },
    match: (h) => h.floors === 3,
  },
  {
    id: "style-modern",
    group: "style",
    slug: { uz: "zamonaviy-uy-loyihalari", ru: "proekty-sovremennyh-domov" },
    title: { uz: "Zamonaviy uy loyihalari", ru: "Проекты современных домов" },
    short: { uz: "Zamonaviy", ru: "Современные" },
    intro: {
      uz: [
        "Zamonaviy uslub — toza chiziqlar, katta oynalar, tekis yoki past qiyalikli tom va tabiiy materiallar: tosh, yog'och, metall. Ichki makon yorug' va ochiq bo'ladi.",
        CLOSING.uz,
      ],
      ru: [
        "Современный стиль — чистые линии, большое остекление, плоская или пологая кровля и натуральные материалы: камень, дерево, металл. Внутри — светлое открытое пространство.",
        CLOSING.ru,
      ],
    },
    match: (h) => h.style === "modern",
  },
  {
    id: "style-neoclassic",
    group: "style",
    slug: { uz: "neoklassik-uy-loyihalari", ru: "proekty-domov-v-stile-neoklassika" },
    title: { uz: "Neoklassik uy loyihalari", ru: "Проекты домов в стиле неоклассика" },
    short: { uz: "Neoklassik", ru: "Неоклассика" },
    intro: {
      uz: [
        "Neoklassik uslub — simmetrik fasad, ustunlar, karnizlar va baland derazalar, zamonaviy qulay reja bilan uyg'unlashgan.",
        CLOSING.uz,
      ],
      ru: [
        "Неоклассика — симметричный фасад, колонны, карнизы и высокие окна в сочетании с современной удобной планировкой.",
        CLOSING.ru,
      ],
    },
    match: (h) => h.style === "neoclassic",
  },
  {
    id: "style-classic",
    group: "style",
    slug: { uz: "klassik-uy-loyihalari", ru: "proekty-domov-v-klassicheskom-stile" },
    title: { uz: "Klassik uy loyihalari", ru: "Проекты домов в классическом стиле" },
    short: { uz: "Klassik", ru: "Классика" },
    intro: {
      uz: ["Klassik uslub — boy bezakli fasad, aniq proporsiyalar va tabiiy tosh.", CLOSING.uz],
      ru: ["Классический стиль — богато украшенный фасад, строгие пропорции и натуральный камень.", CLOSING.ru],
    },
    match: (h) => h.style === "classic",
  },
  plot(4, "сотки"),
  plot(6, "соток"),
  plot(8, "соток"),
  plot(10, "соток"),
  {
    id: "feature-pool",
    group: "feature",
    slug: { uz: "basseynli-uy-loyihalari", ru: "proekty-domov-s-basseynom" },
    title: { uz: "Basseynli uy loyihalari", ru: "Проекты домов с бассейном" },
    short: { uz: "Basseynli", ru: "С бассейном" },
    intro: {
      uz: ["Bu loyihalarda basseyn uy rejasining bir qismi sifatida loyihalangan.", CLOSING.uz],
      ru: ["В этих проектах бассейн предусмотрен в планировке дома.", CLOSING.ru],
    },
    match: (h) => h.features.pool,
  },
  {
    id: "feature-garage",
    group: "feature",
    slug: { uz: "garajli-uy-loyihalari", ru: "proekty-domov-s-garazhom" },
    title: { uz: "Garajli uy loyihalari", ru: "Проекты домов с гаражом" },
    short: { uz: "Garajli", ru: "С гаражом" },
    intro: {
      uz: ["Bu loyihalarda garaj uy rejasiga kiritilgan — mashina hovlida emas, yopiq joyda turadi.", CLOSING.uz],
      ru: ["В этих проектах гараж входит в планировку дома — машина стоит не во дворе, а под крышей.", CLOSING.ru],
    },
    match: (h) => h.features.garage,
  },
];

/** Categories that currently have at least one house, with their houses. */
export function liveCollections(houses: HouseSummary[]) {
  return COLLECTIONS.map((c) => ({ collection: c, houses: houses.filter(c.match) })).filter((x) => x.houses.length > 0);
}

/** Find by slug in either language (a language switch keeps the old slug). */
export function findCollection(slug: string): Collection | undefined {
  return COLLECTIONS.find((c) => c.slug.uz === slug || c.slug.ru === slug);
}

export const collectionPath = (c: Collection, locale: Locale) => `/${locale}/${c.slug[locale]}`;
/** For next-intl's <Link>, which adds the locale prefix itself. */
export const collectionHref = (c: Collection, locale: Locale) => `/${c.slug[locale]}`;
