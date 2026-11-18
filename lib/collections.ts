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
  /** Link label, and the page heading (H1) unless `h1` says otherwise. */
  title: L;
  /** A heading worded the way people search, when it differs from the link label. */
  h1?: Partial<L>;
  /** The whole <title>, when the default "{title} — narxlari va rejalari" misses how people search. */
  metaTitle?: Partial<L>;
  /** What the houses are, for the questions: uz "1 qavatli uy", ru in the genitive "одноэтажного дома". */
  subject: L;
  /** Short label for chips/links. */
  short: L;
  intro: { uz: string[]; ru: string[] };
  /** Blog articles on the same subject (their legacySlug), linked from the page. */
  guides?: string[];
  match: (h: HouseSummary) => boolean;
}

const CLOSING: L = {
  uz: "Har bir loyiha sahifasida o'lchamlar, narx va rasmlar bor. Yoqqan loyihani tanlab, raqamingizni qoldiring — mutaxassisimiz bog'lanadi.",
  ru: "На странице каждого проекта — размеры, цена и фото. Выберите понравившийся проект и оставьте номер — наш специалист свяжется с вами.",
};

const plot = (n: number, ruWord: string, guides: string[] = ["measure-your-plot"]): Collection => ({
  id: `plot-${n}`,
  group: "plot",
  slug: { uz: `${n}-sotix-uchun-uy-loyihalari`, ru: `proekty-domov-na-${n}-${n === 4 ? "sotki" : "sotok"}` },
  // People search "4 sotixga uy loyihasi" and «проект дома на 4 сотках (земли)».
  title: { uz: `${n} sotix yerga uy loyihalari`, ru: `Проекты домов на ${n} сотках` },
  metaTitle: { ru: `Проекты домов на ${n} сотках земли — цены и планировки | Castler` },
  subject: { uz: `${n} sotixga uy`, ru: `дома на ${n} сотках` },
  short: { uz: `${n} sotixgacha`, ru: `до ${n} соток` }, // "до" takes the genitive: до 4 соток
  intro: {
    uz: [
      `Bu sahifada ${n} sotix yerga sig'adigan tayyor uy loyihalari (proektlari) jamlangan. 1 sotix — 100 m², demak ${n} sotix — ${n * 100} m² yer.`,
      "Uy tanlaganda faqat yer maydoniga emas, uning eniga ham qarang: tor yerga kengligi kichikroq loyiha kerak bo'ladi. Pastdagi jadvalda har bir loyiha uchun kerakli yer eni ko'rsatilgan.",
      CLOSING.uz,
    ],
    ru: [
      `Здесь собраны готовые проекты домов на ${n} сотках земли. 1 сотка — это 100 м², значит ${n} ${ruWord} — ${n * 100} м².`,
      "Выбирая проект дома, смотрите не только на площадь участка, но и на его ширину: для узкого участка нужен более узкий дом. В таблице ниже для каждого проекта указана нужная ширина участка.",
      CLOSING.ru,
    ],
  },
  guides,
  match: (h) => h.plotSotix <= n,
});

export const COLLECTIONS: Collection[] = [
  {
    id: "floors-1",
    group: "floors",
    slug: { uz: "1-qavatli-uy-loyihalari", ru: "proekty-odnoetazhnyh-domov" },
    title: { uz: "1 qavatli uy loyihalari", ru: "Проекты одноэтажных домов" },
    // People search "1 qavatli uylar katalogi".
    h1: { uz: "1 qavatli uy loyihalari katalogi", ru: "Каталог проектов одноэтажных домов" },
    metaTitle: {
      uz: "1 qavatli uylar katalogi — uy loyihalari va narxlari | Castler",
      ru: "Проекты одноэтажных домов — каталог, цены и планировки | Castler",
    },
    subject: { uz: "1 qavatli uy", ru: "одноэтажного дома" },
    short: { uz: "1 qavatli", ru: "Одноэтажные" },
    guides: ["one-or-two-floors", "courtyard-house-plan"],
    intro: {
      uz: [
        "1 qavatli uylar katalogi: Castler arxitektorlarining bir qavatli tayyor uy loyihalari, narxlari, rejalari va rasmlari bilan.",
        "Bir qavatli uyda barcha xonalar bir sathda: zinapoya yo'q, keksalar va kichik bolalar uchun qulay, hovliga chiqish oson. Bunday uy kengroq yer talab qiladi, chunki butun maydon bitta qavatga joylashadi.",
        CLOSING.uz,
      ],
      ru: [
        "Каталог одноэтажных домов: готовые проекты от архитекторов Castler — с ценами, планировками и фото.",
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
    subject: { uz: "mansardali uy", ru: "дома с мансардой" },
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
    subject: { uz: "2 qavatli uy", ru: "двухэтажного дома" },
    guides: ["one-or-two-floors", "narrow-lot-house"],
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
    subject: { uz: "3 qavatli uy", ru: "трёхэтажного дома" },
    guides: ["narrow-lot-house"],
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
    // In Uzbek many people write "proekt": "zamonaviy uy proektlari".
    metaTitle: { uz: "Zamonaviy uy proektlari va loyihalari — narxlari | Castler" },
    subject: { uz: "zamonaviy uy", ru: "современного дома" },
    short: { uz: "Zamonaviy", ru: "Современные" },
    guides: ["what-is-in-a-house-plan", "ready-made-or-custom-project"],
    intro: {
      uz: [
        "Zamonaviy uy proektlari — Castler arxitektorlarining zamonaviy uslubdagi tayyor uy loyihalari, narxlari, rejalari va rasmlari bilan.",
        "Zamonaviy uslub — toza chiziqlar, katta oynalar, tekis yoki past qiyalikli tom va tabiiy materiallar: tosh, yog'och, metall. Ichki makon yorug' va ochiq bo'ladi.",
        CLOSING.uz,
      ],
      ru: [
        "Проекты современных домов от архитекторов Castler — готовые решения с ценами, планировками и фото.",
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
    subject: { uz: "neoklassik uy", ru: "дома в стиле неоклассика" },
    guides: ["what-is-in-a-house-plan", "ready-made-or-custom-project"],
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
    subject: { uz: "klassik uy", ru: "дома в классическом стиле" },
    guides: ["what-is-in-a-house-plan", "ready-made-or-custom-project"],
    short: { uz: "Klassik", ru: "Классика" },
    intro: {
      uz: ["Klassik uslub — boy bezakli fasad, aniq proporsiyalar va tabiiy tosh.", CLOSING.uz],
      ru: ["Классический стиль — богато украшенный фасад, строгие пропорции и натуральный камень.", CLOSING.ru],
    },
    match: (h) => h.style === "classic",
  },
  plot(4, "сотки", ["house-on-4-sotix", "narrow-lot-house"]),
  plot(6, "соток", ["house-on-6-sotix", "measure-your-plot"]),
  plot(8, "соток"),
  plot(10, "соток"),
  {
    id: "feature-pool",
    group: "feature",
    slug: { uz: "basseynli-uy-loyihalari", ru: "proekty-domov-s-basseynom" },
    title: { uz: "Basseynli uy loyihalari", ru: "Проекты домов с бассейном" },
    subject: { uz: "basseynli uy", ru: "дома с бассейном" },
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
    subject: { uz: "garajli uy", ru: "дома с гаражом" },
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
