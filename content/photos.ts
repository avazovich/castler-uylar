/**
 * Words for the photos-and-plans page («Uy loyihalari rasmlari va chizmalari» /
 * «Проекты домов: фото и чертежи») — the phrases people type into Google when
 * they look for house pictures and drawings (Google autocomplete, 2026-11-25:
 * «uy proektlari rasmlari», «uy loyihalari chizmalari», «проекты домов фото и чертежи»).
 */
import type { Locale } from "@/i18n/routing";

type L = Record<Locale, string>;

export const PHOTOS_SLUG: L = { uz: "uy-loyihalari-rasmlari", ru: "proekty-domov-foto-i-chertezhi" };
export const photosPath = (locale: Locale) => `/${PHOTOS_SLUG[locale]}`;

export const PHOTOS_TEXT = {
  nav: { uz: "Rasmlar va chizmalar", ru: "Фото и чертежи" },
  h1: { uz: "Uy loyihalari rasmlari va chizmalari", ru: "Проекты домов: фото и чертежи" },
  subtitle: {
    uz: "Tayyor uy loyihalarimizning barcha rasmlari va qavat rejalari — bir sahifada.",
    ru: "Все фото и планы этажей наших готовых проектов домов — на одной странице.",
  },
  plans: { uz: "Qavat rejalari", ru: "Планы этажей" },
  open: { uz: "Loyihani ko‘rish", ru: "Смотреть проект" },
} satisfies Record<string, L>;

/** "Uy loyihalari rasmlari va chizmalari — 20 ta tayyor loyiha | Castler" */
export function photosTitle(locale: Locale, houses: number): string {
  return locale === "ru"
    ? `Проекты домов: фото и чертежи — ${houses} готовых проектов | Castler`
    : `Uy loyihalari rasmlari va chizmalari — ${houses} ta tayyor loyiha | Castler`;
}

/** Built from the catalog's own numbers, so it is always true. */
export function photosDescription(locale: Locale, houses: number, photos: number, kinds: string): string {
  return locale === "ru"
    ? `${photos} фото и планы этажей ${houses} готовых проектов домов: ${kinds}. Нажмите на фото — цена, комнаты и площадь.`
    : `${houses} ta tayyor uy loyihasining ${photos} ta rasmi va qavat rejalari: ${kinds}. Rasmni bosing — narx, xonalar va maydon.`;
}

/** The lead paragraph under the title. */
export function photosIntro(locale: Locale, houses: number, photos: number, plans: number): string {
  return locale === "ru"
    ? `Здесь собраны ${photos} фото и ${plans} планов этажей всех ${houses} готовых проектов Castler. Под каждым проектом — его площадь и участок; нажмите на фото, чтобы открыть проект с ценой, комнатами и расчётом стоимости строительства.`
    : `Bu yerda Castler’ning ${houses} ta tayyor loyihasining ${photos} ta rasmi va ${plans} ta qavat rejasi jamlangan. Har bir loyiha ostida uning maydoni va yer o‘lchami; rasmni bosing — narxi, xonalari va qurilish narxi hisobi bilan loyiha sahifasi ochiladi.`;
}
