/**
 * Fixed vocabularies for house plans. Editors pick from these lists in the
 * Studio and the site shows the label in the visitor's language — so a
 * room typed once as "kitchen" needs no separate Russian translation.
 * Anything not covered uses the "other" entry plus a typed custom name.
 */

type Labels = { uz: string; ru: string };

export const ROOM_TYPES = {
  living: { uz: "Mehmonxona", ru: "Гостиная" },
  kitchenDining: { uz: "Oshxona-ovqatlanish xonasi", ru: "Кухня-столовая" },
  kitchen: { uz: "Oshxona", ru: "Кухня" },
  dining: { uz: "Ovqatlanish xonasi", ru: "Столовая" },
  masterBedroom: { uz: "Ota-onalar yotoqxonasi", ru: "Родительская спальня" },
  bedroom: { uz: "Yotoqxona", ru: "Спальня" },
  kidsBedroom: { uz: "Bolalar xonasi", ru: "Детская" },
  guestRoom: { uz: "Mehmonlar xonasi", ru: "Гостевая комната" },
  study: { uz: "Kabinet", ru: "Кабинет" },
  hall: { uz: "Xoll", ru: "Холл" },
  vestibule: { uz: "Tambur", ru: "Тамбур" },
  corridor: { uz: "Yo'lak", ru: "Коридор" },
  stairs: { uz: "Zinapoya maydonchasi", ru: "Лестничная площадка" },
  bathroom: { uz: "Sanuzel", ru: "Санузел" },
  shower: { uz: "Dush xonasi", ru: "Душевая" },
  wardrobe: { uz: "Garderob", ru: "Гардероб" },
  laundry: { uz: "Kir yuvish xonasi", ru: "Прачечная" },
  boiler: { uz: "Qozonxona", ru: "Котельная" },
  storage: { uz: "Omborxona", ru: "Кладовая" },
  garage: { uz: "Garaj", ru: "Гараж" },
  terrace: { uz: "Terrasa", ru: "Терраса" },
  balcony: { uz: "Balkon", ru: "Балкон" },
  summerKitchen: { uz: "Yozgi oshxona", ru: "Летняя кухня" },
  pool: { uz: "Basseyn", ru: "Бассейн" },
  sauna: { uz: "Sauna", ru: "Сауна" },
  gym: { uz: "Sport zali", ru: "Спортзал" },
  cinema: { uz: "Kinozal", ru: "Кинозал" },
  other: { uz: "Boshqa", ru: "Другое" },
} satisfies Record<string, Labels>;
export type RoomType = keyof typeof ROOM_TYPES;

// Rooms counted for the "bedrooms" / "bathrooms" figures on cards and filters.
export const BEDROOM_TYPES: RoomType[] = ["masterBedroom", "bedroom", "kidsBedroom", "guestRoom"];
export const BATHROOM_TYPES: RoomType[] = ["bathroom", "shower"];

export const LEVELS = {
  basement: { uz: "Yerto'la", ru: "Подвал" },
  ground: { uz: "1-qavat", ru: "1 этаж" },
  second: { uz: "2-qavat", ru: "2 этаж" },
  third: { uz: "3-qavat", ru: "3 этаж" },
  attic: { uz: "Mansarda", ru: "Мансарда" },
  roof: { uz: "Tom terrasasi", ru: "Терраса на крыше" },
  yard: { uz: "Hovlidagi binolar", ru: "Дворовые постройки" },
} satisfies Record<string, Labels>;
export type Level = keyof typeof LEVELS;

export const COST_PARTS = {
  basement: { uz: "Yerto'la", ru: "Подвал" },
  ground: { uz: "1-qavat", ru: "1 этаж" },
  second: { uz: "2-qavat", ru: "2 этаж" },
  third: { uz: "3-qavat", ru: "3 этаж" },
  attic: { uz: "Mansarda", ru: "Мансарда" },
  roof: { uz: "Tom", ru: "Кровля" },
  summerKitchen: { uz: "Yozgi oshxona", ru: "Летняя кухня" },
  pool: { uz: "Basseyn", ru: "Бассейн" },
  garage: { uz: "Garaj", ru: "Гараж" },
  fence: { uz: "Devor va darvoza", ru: "Забор и ворота" },
  other: { uz: "Boshqa", ru: "Другое" },
} satisfies Record<string, Labels>;
export type CostPart = keyof typeof COST_PARTS;

export const STYLES = {
  modern: { uz: "Zamonaviy", ru: "Современный" },
  neoclassic: { uz: "Neoklassik", ru: "Неоклассика" },
  classic: { uz: "Klassik", ru: "Классика" },
} satisfies Record<string, Labels>;
export type Style = keyof typeof STYLES;

export const FLOOR_OPTIONS = [1, 1.5, 2, 2.5, 3] as const;

/** Studio dropdown entries ({ title, value }) for one of the lists above. */
export function studioOptions(map: Record<string, Labels>) {
  return Object.entries(map).map(([value, l]) => ({ value, title: `${l.uz} — ${l.ru}` }));
}
