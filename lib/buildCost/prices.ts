/**
 * Unit prices for the house-cost calculator — Namangan, November 2026, in so‘m.
 *
 * `source: "market"` = a current listing or price list was found for this item
 * (see SOURCES); `"estimate"` = no clear public price, so the number is a
 * reasoned estimate that a builder should confirm. The page shows the
 * difference, so a visitor always knows which prices are which.
 */

export type L = { uz: string; ru: string };
/** "both" = a price that already includes the work (windows with installation, facade packages…). */
export type PriceKind = "material" | "labour" | "both";
export type PriceSource = "market" | "estimate";

export interface PriceItem {
  label: L;
  unit: L;
  uzs: number;
  kind: PriceKind;
  source: PriceSource;
}

const M3 = { uz: "m³", ru: "м³" };
const M2 = { uz: "m²", ru: "м²" };
const M = { uz: "m", ru: "м" };
const T = { uz: "t", ru: "т" };
const PC = { uz: "dona", ru: "шт" };
const BAG = { uz: "qop", ru: "мешок" };
const SET = { uz: "kompl.", ru: "компл." };

export const PRICES_AS_OF = { uz: "2026-yil noyabr, Namangan", ru: "ноябрь 2026, Наманган" };

/** Used only when the Central Bank's rate can't be fetched. */
export const FALLBACK_USD = { rate: 12014.37, date: "14.11.2026" };

export const PRICES = {
  // ── Materials ────────────────────────────────────────────────
  concreteM250: { label: { uz: "Beton M250", ru: "Бетон М250" }, unit: M3, uzs: 470_000, kind: "material", source: "estimate" },
  concreteM300: { label: { uz: "Beton M300", ru: "Бетон М300" }, unit: M3, uzs: 500_000, kind: "material", source: "market" },
  rebar: { label: { uz: "Armatura A500C", ru: "Арматура А500С" }, unit: T, uzs: 9_300_000, kind: "material", source: "market" },
  brick: { label: { uz: "Pishgan g‘isht", ru: "Жжёный кирпич" }, unit: PC, uzs: 1_050, kind: "material", source: "market" },
  gasblock: { label: { uz: "Gazoblok 600×300×200", ru: "Газоблок 600×300×200" }, unit: PC, uzs: 12_000, kind: "material", source: "market" },
  cement: { label: { uz: "Sement M400, 50 kg", ru: "Цемент М400, 50 кг" }, unit: BAG, uzs: 55_000, kind: "material", source: "market" },
  sand: { label: { uz: "Qum", ru: "Песок" }, unit: M3, uzs: 150_000, kind: "material", source: "estimate" },
  gravel: { label: { uz: "Shag‘al", ru: "Щебень" }, unit: M3, uzs: 140_000, kind: "material", source: "estimate" },
  formwork: { label: { uz: "Qolip (opalubka) taxtasi", ru: "Опалубка, доска" }, unit: M2, uzs: 45_000, kind: "material", source: "estimate" },
  formworkRent: { label: { uz: "Qolip va tirgaklar ijarasi", ru: "Аренда опалубки и стоек" }, unit: M2, uzs: 35_000, kind: "material", source: "estimate" },
  waterproofing: { label: { uz: "Gidroizolyatsiya", ru: "Гидроизоляция" }, unit: M2, uzs: 30_000, kind: "material", source: "estimate" },
  timber: { label: { uz: "Tom uchun yog‘och", ru: "Пиломатериал для кровли" }, unit: M3, uzs: 3_800_000, kind: "material", source: "estimate" },
  roofTile: { label: { uz: "Metallocherepitsa", ru: "Металлочерепица" }, unit: M2, uzs: 85_000, kind: "material", source: "market" },
  roofInsulation: { label: { uz: "Mineral paxta, 10 sm", ru: "Минвата, 10 см" }, unit: M2, uzs: 55_000, kind: "material", source: "estimate" },
  gutter: { label: { uz: "Tarnov va quvurlar", ru: "Водосток" }, unit: M, uzs: 90_000, kind: "material", source: "estimate" },
  flatRoof: { label: { uz: "Tekis tom: issiqlik va suv izolyatsiyasi", ru: "Плоская кровля: утепление и мембрана" }, unit: M2, uzs: 140_000, kind: "material", source: "estimate" },
  window: { label: { uz: "Alyumin deraza, o‘rnatish bilan", ru: "Алюминиевые окна с монтажом" }, unit: M2, uzs: 900_000, kind: "both", source: "market" },
  entranceDoor: { label: { uz: "Kirish eshigi (issiq)", ru: "Входная дверь (тёплая)" }, unit: PC, uzs: 4_500_000, kind: "material", source: "estimate" },
  backDoor: { label: { uz: "Hovliga chiqish eshigi", ru: "Дверь во двор" }, unit: PC, uzs: 2_000_000, kind: "material", source: "estimate" },
  interiorDoor: { label: { uz: "Xona eshigi, o‘rnatish bilan", ru: "Межкомнатная дверь с монтажом" }, unit: PC, uzs: 1_800_000, kind: "both", source: "estimate" },
  electrics: { label: { uz: "Elektr: kabel, shit, rozetkalar, ishi bilan", ru: "Электрика: кабель, щит, розетки, с работой" }, unit: M2, uzs: 110_000, kind: "both", source: "estimate" },
  wetRoom: { label: { uz: "Suv va kanalizatsiya quvurlari, ishi bilan (hammom/oshxona)", ru: "Водопровод и канализация с работой (санузел/кухня)" }, unit: SET, uzs: 5_000_000, kind: "both", source: "estimate" },
  utilities: { label: { uz: "Suv va kanalizatsiyani tarmoqqa ulash", ru: "Подключение воды и канализации к сетям" }, unit: SET, uzs: 6_000_000, kind: "both", source: "estimate" },
  boiler: { label: { uz: "Gaz qozon (ikki konturli), o‘rnatish bilan", ru: "Газовый котёл (двухконтурный) с монтажом" }, unit: PC, uzs: 9_000_000, kind: "both", source: "estimate" },
  heating: { label: { uz: "Radiator va quvurlar, o‘rnatish bilan", ru: "Радиаторы и трубы с монтажом" }, unit: M2, uzs: 140_000, kind: "both", source: "estimate" },
  plaster: { label: { uz: "Suvoq aralashmasi", ru: "Штукатурная смесь" }, unit: M2, uzs: 22_000, kind: "material", source: "estimate" },
  screed: { label: { uz: "Styajka aralashmasi", ru: "Смесь для стяжки" }, unit: M2, uzs: 40_000, kind: "material", source: "estimate" },
  facadeModern: { label: { uz: "Fasad: issiqlik izolyatsiyasi, dekor suvoq, bo‘yoq — ishi bilan", ru: "Фасад: утепление, декоративная штукатурка, покраска — с работой" }, unit: M2, uzs: 260_000, kind: "both", source: "estimate" },
  facadeNeoclassic: { label: { uz: "Fasad: suvoq, karniz va dekor, bo‘yoq — ishi bilan", ru: "Фасад: штукатурка, карнизы и декор, покраска — с работой" }, unit: M2, uzs: 380_000, kind: "both", source: "estimate" },
  facadeClassic: { label: { uz: "Fasad: travertin, tosh dekor, karniz — ishi bilan", ru: "Фасад: травертин, каменный декор, карнизы — с работой" }, unit: M2, uzs: 650_000, kind: "both", source: "estimate" },
  floorFinish: { label: { uz: "Pol: kafel yoki laminat", ru: "Пол: плитка или ламинат" }, unit: M2, uzs: 180_000, kind: "material", source: "estimate" },
  paint: { label: { uz: "Shpaklyovka va bo‘yoq", ru: "Шпаклёвка и краска" }, unit: M2, uzs: 35_000, kind: "material", source: "estimate" },
  ceiling: { label: { uz: "Shift: gipsokarton yoki tortma shift, o‘rnatish bilan", ru: "Потолок: гипсокартон или натяжной, с монтажом" }, unit: M2, uzs: 150_000, kind: "both", source: "estimate" },
  bathroom: { label: { uz: "Hammom: kafel, santexnika, o‘rnatish bilan", ru: "Санузел: плитка, сантехника, с монтажом" }, unit: SET, uzs: 15_000_000, kind: "both", source: "estimate" },
  stairFinish: { label: { uz: "Zinapoya qoplamasi va panjarasi", ru: "Отделка и перила лестницы" }, unit: SET, uzs: 12_000_000, kind: "both", source: "estimate" },
  fence: { label: { uz: "G‘isht devor 2,5 m, poydevori va ishi bilan", ru: "Кирпичный забор 2,5 м с фундаментом и работой" }, unit: M, uzs: 1_400_000, kind: "both", source: "estimate" },
  gate: { label: { uz: "Darvoza va kichik eshik", ru: "Ворота и калитка" }, unit: PC, uzs: 12_000_000, kind: "material", source: "estimate" },
  paving: { label: { uz: "Hovli yo‘laklari: plitka, ishi bilan", ru: "Дорожки во дворе: плитка с работой" }, unit: M2, uzs: 160_000, kind: "both", source: "estimate" },

  // ── Labour (usta haqi) ───────────────────────────────────────
  excavation: { label: { uz: "Usta: tuproq qazish va olib chiqish", ru: "Работа: выемка и вывоз грунта" }, unit: M3, uzs: 30_000, kind: "labour", source: "estimate" },
  concreteWork: { label: { uz: "Usta: armatura bog‘lash, qolip, beton quyish", ru: "Работа: армирование, опалубка, бетонирование" }, unit: M3, uzs: 180_000, kind: "labour", source: "estimate" },
  frameWork: { label: { uz: "Usta: kamar, ustun, plita quyish", ru: "Работа: пояса, колонны, перекрытия" }, unit: M3, uzs: 250_000, kind: "labour", source: "estimate" },
  bricklaying: { label: { uz: "Usta: g‘isht terish", ru: "Работа: кладка кирпича" }, unit: PC, uzs: 1_200, kind: "labour", source: "estimate" },
  blocklaying: { label: { uz: "Usta: gazoblok terish", ru: "Работа: кладка газоблока" }, unit: PC, uzs: 6_000, kind: "labour", source: "estimate" },
  roofWork: { label: { uz: "Usta: tom yopish", ru: "Работа: монтаж кровли" }, unit: M2, uzs: 115_000, kind: "labour", source: "estimate" },
  plasterWork: { label: { uz: "Usta: devor suvoq", ru: "Работа: штукатурка стен" }, unit: M2, uzs: 45_000, kind: "labour", source: "estimate" },
  ceilingWork: { label: { uz: "Usta: shift suvoq", ru: "Работа: штукатурка потолка" }, unit: M2, uzs: 50_000, kind: "labour", source: "estimate" },
  screedWork: { label: { uz: "Usta: pol styajkasi", ru: "Работа: стяжка пола" }, unit: M2, uzs: 38_000, kind: "labour", source: "estimate" },
  floorWork: { label: { uz: "Usta: pol yotqizish", ru: "Работа: укладка пола" }, unit: M2, uzs: 70_000, kind: "labour", source: "estimate" },
  paintWork: { label: { uz: "Usta: shpaklyovka va bo‘yash", ru: "Работа: шпаклёвка и покраска" }, unit: M2, uzs: 40_000, kind: "labour", source: "estimate" },
} satisfies Record<string, PriceItem>;

export type PriceId = keyof typeof PRICES;

/** Where the "market" prices came from — shown under the calculator. */
export const SOURCES: { label: L; url: string }[] = [
  { label: { uz: "OLX, Namangan viloyati: g‘isht 925–1 100, gazoblok 9 000–16 000 so‘m (2026-yil noyabr)", ru: "OLX, Наманганская обл.: кирпич 925–1 100, газоблок 9 000–16 000 сум (ноябрь 2026)" }, url: "https://www.olx.uz/oz/dom-i-sad/tovari-dlya-stroitelstva-remonta/kirpich-beton-penobloki/namangan/" },
  { label: { uz: "Prom.uz, Ibrat Beton (Namangan): beton M300 — 500 000 so‘mdan", ru: "Prom.uz, Ibrat Beton (Наманган): бетон М300 — от 500 000 сум" }, url: "https://www.prom.uz/uz/section/beton/" },
  { label: { uz: "Megametal, Tovar.uz, Uzmetallsavdo: armatura 8,2–9,6 mln so‘m/t", ru: "Megametal, Tovar.uz, Uzmetallsavdo: арматура 8,2–9,6 млн сум/т" }, url: "https://megametal.uz/uz/product/show/2ec7f753-0f21-4c3e-b6ed-121d17e035dc" },
  { label: { uz: "Bugun Narxi (Makro, Namangan) va 24stroy: sement 35 000–63 657 so‘m/qop", ru: "Bugun Narxi (Makro, Наманган) и 24stroy: цемент 35 000–63 657 сум/мешок" }, url: "https://bugun-narxi.com/mahsulot/sement" },
  { label: { uz: "Tovar.uz, Glotr.uz: alyumin deraza 550 000–1 700 000 so‘m/m²", ru: "Tovar.uz, Glotr.uz: алюминиевые окна 550 000–1 700 000 сум/м²" }, url: "https://tovar.uz/uz/service/583" },
  { label: { uz: "Prom.uz: metallocherepitsa 79 400–89 500 so‘m/m²", ru: "Prom.uz: металлочерепица 79 400–89 500 сум/м²" }, url: "https://www.prom.uz/uz/brand/metall-profil/krovelnye-materialy/" },
  { label: { uz: "Ustabor.uz: ustalar narxlari (Namangan va O‘zbekiston bo‘yicha)", ru: "Ustabor.uz: цены мастеров (Наманган и Узбекистан)" }, url: "https://www.ustabor.uz/ru/price" },
  { label: { uz: "Markaziy bank: dollar kursi", ru: "Центральный банк: курс доллара" }, url: "https://cbu.uz/uz/arkhiv-kursov-valyut/" },
];
