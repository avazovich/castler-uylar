/**
 * Words for the brick, gas-block and concrete calculator pages, in both
 * languages. Titles and questions use the phrases people type into Google
 * («g‘isht o‘lchami», «сколько газоблока в кубе», «beton tarkibini hisoblash»).
 * Every number in an answer is passed in from lib/buildCost/materials.ts.
 */
import type { Locale } from "@/i18n/routing";
import type { MaterialKind } from "@/lib/buildCost/materials";

type L = Record<Locale, string>;

export const MATERIAL_SLUG: Record<MaterialKind, L> = {
  brick: { uz: "gisht-hisoblash-kalkulyatori", ru: "kalkulyator-kirpicha" },
  block: { uz: "gazoblok-hisoblash-kalkulyatori", ru: "kalkulyator-gazobloka" },
  concrete: { uz: "beton-hisoblash-kalkulyatori", ru: "kalkulyator-betona" },
};
export const MATERIAL_KINDS: MaterialKind[] = ["brick", "block", "concrete"];
export const materialPath = (kind: MaterialKind, locale: Locale) => `/${MATERIAL_SLUG[kind][locale]}`;

export const MATERIAL_PAGE: Record<MaterialKind, { title: L; description: L; h1: L; short: L; intro: L }> = {
  brick: {
    title: { uz: "G‘isht kalkulyatori: 1 m² devorga nechta g‘isht | Castler", ru: "Калькулятор кирпича на дом и стену — расчёт онлайн | Castler" },
    description: {
      uz: "Devor yoki uy uchun qancha g‘isht, sement va qum kerakligini hisoblang: 1 m² ga 51–204 dona, Namangan narxlarida so‘m va dollarda. Bepul.",
      ru: "Сколько кирпича нужно на стену или дом: количество, цемент и песок для раствора, стоимость по ценам Намангана в сумах и долларах. Бесплатно.",
    },
    h1: { uz: "G‘isht hisoblash kalkulyatori", ru: "Калькулятор кирпича" },
    short: { uz: "G‘isht", ru: "Кирпич" },
    intro: {
      uz: "Devorning uzunligi va balandligini yoki uyning o‘lchamini kiriting — qancha g‘isht, sement va qum kerakligini va bularning narxini usta haqi bilan birga ko‘rasiz.",
      ru: "Введите длину и высоту стены или размеры дома — увидите, сколько нужно кирпича, цемента и песка и сколько это стоит вместе с работой.",
    },
  },
  block: {
    title: { uz: "Gazoblok kalkulyatori: 1 m² va 1 m³ ga nechta blok | Castler", ru: "Калькулятор газоблока на дом — сколько блоков в кубе | Castler" },
    description: {
      uz: "Devor yoki uy uchun qancha gazoblok, sement va qum kerakligini hisoblang: 600×300×200 blok, Namangan narxlarida so‘m va dollarda. Bepul.",
      ru: "Сколько газоблока нужно на дом или стену, сколько блоков в кубе и в 1 м²: блок 600×300×200, цены Намангана в сумах и долларах. Бесплатно.",
    },
    h1: { uz: "Gazoblok hisoblash kalkulyatori", ru: "Калькулятор газоблока" },
    short: { uz: "Gazoblok", ru: "Газоблок" },
    intro: {
      uz: "Devorning yoki uyning o‘lchamini kiriting — qancha gazoblok va qorishma kerakligini, narxini usta haqi bilan birga ko‘rasiz.",
      ru: "Введите размеры стены или дома — увидите, сколько нужно газоблока и раствора и сколько это стоит вместе с работой.",
    },
  },
  concrete: {
    title: { uz: "Beton hisoblash kalkulyatori: tarkibi va hajmi | Castler", ru: "Калькулятор бетона на фундамент — объём и пропорции | Castler" },
    description: {
      uz: "Poydevor yoki plita uchun necha kub beton kerak va uning tarkibi: sement, qum, shag‘al, suv (M200, M250, M300). Tayyor beton narxi bilan solishtiring.",
      ru: "Сколько кубов бетона нужно на фундамент или плиту и его пропорции: цемент, песок, щебень, вода (М200, М250, М300). Сравните с ценой готового бетона.",
    },
    h1: { uz: "Beton hisoblash kalkulyatori", ru: "Калькулятор бетона" },
    short: { uz: "Beton", ru: "Бетон" },
    intro: {
      uz: "Poydevor yoki plitaning o‘lchamini kiriting — necha kub beton, qancha sement, qum, shag‘al va armatura kerakligini, tayyor beton va o‘zingiz aralashtirgandagi narxni ko‘rasiz.",
      ru: "Введите размеры фундамента или плиты — увидите, сколько кубов бетона, цемента, песка, щебня и арматуры нужно и сколько стоит готовый бетон или замес на месте.",
    },
  },
};

/** Labels of the calculator itself. */
export const MATERIAL_UI = {
  uz: {
    what: "Nimani hisoblaymiz?", whatConcrete: "Nimaga beton quyiladi?", wall: "Devor", house: "Butun uy", length: "Devorlar uzunligi", height: "Balandligi", openings: "Deraza va eshiklar",
    houseWidth: "Uy eni", houseLength: "Uy bo‘yi", floors: "Qavatlar", thickness: "Devor qalinligi",
    houseHint: "Tashqi devorlar: 2 × (eni + bo‘yi), har qavat 3 m. Ichki devorlarni «Devor» rejimida alohida hisoblang.",
    brickThickness: { 0.5: "Yarim g‘isht · 12 sm", 1: "1 g‘isht · 25 sm", 1.5: "1,5 g‘isht · 38 sm", 2: "2 g‘isht · 51 sm" },
    blockThickness: { 20: "20 sm", 30: "30 sm" },
    bricks: "dona g‘isht", blocks: "dona gazoblok", breakage: "sinishiga 5 % qo‘shilgan",
    area: "Devor maydoni", volume: "Hajmi",
    strip: "Lenta poydevor", slab: "Plita", stripLength: "Poydevor uzunligi", trenchWidth: "Eni", depth: "Chuqurligi",
    slabLength: "Uzunligi", slabWidth: "Eni", thicknessM: "Qalinligi", grade: "Beton markasi",
    stripHint: "Uy uchun: tashqi devorlar 2 × (eni + bo‘yi), ichki yuk ko‘taruvchi devorlarni ham qo‘shing.",
    concreteM3: "m³ beton", order: "Buyurtma: {order} m³ (5 % zaxira bilan)",
    perM3: "1 m³ beton uchun", cement: "Sement", sand: "Qum", gravel: "Shag‘al", water: "Suv", bag: "qop", litre: "l", ratio: "Nisbati (sement : qum : shag‘al)",
    ready: "Tayyor beton (zavoddan)", selfMix: "O‘zingiz aralashtirsangiz", noReady: "M200 tayyor beton narxini zavoddan so‘rang.",
    rebar: "Armatura taxminan {kg} kg", water2: "Suv taxminan {l} l",
    item: "Nima", qty: "Miqdori", price: "Narxi", sum: "Jami", materials: "Materiallar", labour: "Usta haqi", total: "Jami",
    som: "so‘m", currency: "Valyuta", m: "m", m2: "m²", m3: "m³", kg: "kg", t: "t",
    note: "Narxlar: {date}. Usta haqi — taxminiy, ustangiz bilan kelishing.",
    houseCalc: "Butun uy qurish narxini hisoblash", catalog: "Tayyor uy loyihalari",
  },
  ru: {
    what: "Что считаем?", whatConcrete: "Что заливаем?", wall: "Стена", house: "Весь дом", length: "Длина стен", height: "Высота", openings: "Окна и двери",
    houseWidth: "Ширина дома", houseLength: "Длина дома", floors: "Этажей", thickness: "Толщина стены",
    houseHint: "Наружные стены: 2 × (ширина + длина), каждый этаж 3 м. Внутренние стены посчитайте отдельно в режиме «Стена».",
    brickThickness: { 0.5: "В полкирпича · 12 см", 1: "В 1 кирпич · 25 см", 1.5: "В 1,5 кирпича · 38 см", 2: "В 2 кирпича · 51 см" },
    blockThickness: { 20: "20 см", 30: "30 см" },
    bricks: "шт кирпича", blocks: "шт газоблока", breakage: "с запасом 5 % на бой",
    area: "Площадь стен", volume: "Объём",
    strip: "Ленточный фундамент", slab: "Плита", stripLength: "Длина фундамента", trenchWidth: "Ширина", depth: "Глубина",
    slabLength: "Длина", slabWidth: "Ширина", thicknessM: "Толщина", grade: "Марка бетона",
    stripHint: "Для дома: наружные стены 2 × (ширина + длина), добавьте внутренние несущие стены.",
    concreteM3: "м³ бетона", order: "Заказ: {order} м³ (с запасом 5 %)",
    perM3: "На 1 м³ бетона", cement: "Цемент", sand: "Песок", gravel: "Щебень", water: "Вода", bag: "мешка", litre: "л", ratio: "Пропорция (цемент : песок : щебень)",
    ready: "Готовый бетон (с завода)", selfMix: "Замес на месте", noReady: "Цену готового бетона М200 уточните на заводе.",
    rebar: "Арматура примерно {kg} кг", water2: "Вода примерно {l} л",
    item: "Что", qty: "Количество", price: "Цена", sum: "Сумма", materials: "Материалы", labour: "Работа", total: "Итого",
    som: "сум", currency: "Валюта", m: "м", m2: "м²", m3: "м³", kg: "кг", t: "т",
    note: "Цены: {date}. Работа мастеров — ориентировочно, уточните у своего мастера.",
    houseCalc: "Посчитать стоимость всего дома", catalog: "Готовые проекты домов",
  },
} as const;
export type MaterialUi = (typeof MATERIAL_UI)[Locale];

/** Section headings on the page. */
export const MATERIAL_TEXT = {
  uz: {
    refTitle: { brick: "1 m² devorga nechta g‘isht ketadi", block: "1 m² va 1 m³ ga nechta gazoblok", concrete: "Beton tarkibi: 1 m³ uchun" },
    thickness: "Devor qalinligi", perM2: "1 m² ga", costM2: "1 m² narxi (material + usta)", grade: "Marka", readyM3: "Tayyor beton, 1 m³",
    faqTitle: "Ko‘p so‘raladigan savollar", otherTitle: "Boshqa kalkulyatorlar",
  },
  ru: {
    refTitle: { brick: "Сколько кирпича в 1 м² стены", block: "Сколько газоблока в 1 м² и в 1 м³", concrete: "Пропорции бетона на 1 м³" },
    thickness: "Толщина стены", perM2: "На 1 м²", costM2: "Цена 1 м² (материал + работа)", grade: "Марка", readyM3: "Готовый бетон, 1 м³",
    faqTitle: "Частые вопросы", otherTitle: "Другие калькуляторы",
  },
} as const;
