/**
 * The extra content of a category page ("4 sotix yerga uy loyihalari", "Проекты
 * одноэтажных домов" …): a few facts, a comparison table and the usual questions.
 * Everything is worked out from the houses on the page and the site settings, so
 * it is always true and updates itself when a house is added or its price changes.
 */
import type { Locale } from "@/i18n/routing";
import type { Collection } from "./collections";
import { formatNumber as f } from "./format";
import type { HouseSummary, SiteSettings } from "./houses";
import { ruPlural, type Faq } from "./seo";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const named = (h: HouseSummary, locale: Locale) =>
  h.name ? (locale === "ru" ? `«${h.name}» (№ ${h.code})` : `«${h.name}» (№${h.code})`) : `№${h.code}`;
const sotix = (n: number, locale: Locale) => (locale === "ru" ? `${f(n)} ${ruPlural(n, "сотка", "сотки", "соток")}` : `${f(n)} sotix`);
const projects = (n: number, locale: Locale) =>
  locale === "ru" ? `${n} ${ruPlural(n, "проект", "проекта", "проектов")}` : `${n} ta loyiha`;

export interface CollectionFacts {
  count: number;
  priceMin: number;
  priceMax: number;
  cheapest: HouseSummary;
  sotixMin: number;
  sotixMax: number;
  /** The house that fits the narrowest plot, when widths are known. */
  narrowest?: HouseSummary & { minPlotWidth: number };
  floors: number[];
}

export function collectionFacts(houses: HouseSummary[]): CollectionFacts {
  const byPrice = [...houses].sort((a, b) => a.priceUzs - b.priceUzs);
  const withWidth = houses.filter((h): h is HouseSummary & { minPlotWidth: number } => Boolean(h.minPlotWidth));
  return {
    count: houses.length,
    priceMin: byPrice[0].priceUzs,
    priceMax: byPrice[byPrice.length - 1].priceUzs,
    cheapest: byPrice[0],
    sotixMin: Math.min(...houses.map((h) => h.plotSotix)),
    sotixMax: Math.max(...houses.map((h) => h.plotSotix)),
    narrowest: withWidth.sort((a, b) => a.minPlotWidth - b.minPlotWidth)[0],
    floors: [...new Set(houses.map((h) => h.floors))].sort((a, b) => a - b),
  };
}

/** Rows for the comparison table: smallest plot first on plot pages, cheapest first elsewhere. */
export function comparisonRows(c: Collection, houses: HouseSummary[]): HouseSummary[] {
  return [...houses].sort((a, b) =>
    c.group === "plot" ? a.plotSotix - b.plotSotix || a.priceUzs - b.priceUzs : a.priceUzs - b.priceUzs,
  );
}

/** Uzbek: "9 800 000 so'mdan 25 000 000 so'mgacha", "3 sotixdan 5 sotixgacha". */
const uzRange = (a: number, b: number, unit: string) => (a === b ? `${f(a)} ${unit}` : `${f(a)} ${unit}dan ${f(b)} ${unit}gacha`);
/** Russian genitive after "от … до": до 4 соток, до 21 сотки, до 3,5 сотки. */
const sotokGen = (n: number) => (!Number.isInteger(n) || (n % 10 === 1 && n % 100 !== 11) ? "сотки" : "соток");
/** "одноэтажного дома" → "одноэтажный дом", "дома на 4 сотках" → "дом на 4 сотках". */
const ruAcc = (gen: string) => (gen.startsWith("дома ") ? `дом ${gen.slice(5)}` : gen.replace(/ого дома$/, "ый дом"));

export function collectionFaq(c: Collection, houses: HouseSummary[], settings: SiteSettings, locale: Locale): Faq[] {
  const x = collectionFacts(houses);
  const ru = locale === "ru";
  const subject = c.subject[locale];
  const out: Faq[] = [];
  const n = Number(c.id.replace("plot-", ""));
  const ones = houses.filter((h) => h.floors === 1).length;
  const twos = houses.filter((h) => h.floors === 2).length;
  const list = houses
    .slice(0, 6)
    .map((h) => `${named(h, locale)} — ${sotix(h.plotSotix, locale)}, ${ru ? `${f(h.floors)} ${ruPlural(h.floors, "этаж", "этажа", "этажей")}` : `${f(h.floors)} qavat`}`)
    .join("; ");

  if (ru) {
    if (c.group === "plot") {
      out.push({
        q: `Сколько квадратных метров в ${n} сотках?`,
        a: `${sotix(n, locale)} — ${f(n * 100)} м². Одна сотка — это 100 м², например участок 10 × 10 м.`,
      });
      out.push({
        q: `Какой дом можно построить на ${n} сотках?`,
        a: `В каталоге ${projects(x.count, locale)} для участков до ${n} соток: ${list}.${x.narrowest ? ` Самый узкий участок нужен для проекта ${named(x.narrowest, locale)} — шириной от ${f(x.narrowest.minPlotWidth)} м.` : ""}`,
      });
      if (ones && twos)
        out.push({
          q: `Одноэтажный или двухэтажный дом на ${n} сотках?`,
          a: `Здесь ${ones} ${ruPlural(ones, "одноэтажный проект", "одноэтажных проекта", "одноэтажных проектов")} и ${twos} ${ruPlural(twos, "двухэтажный", "двухэтажных", "двухэтажных")}. На небольшом участке двухэтажный дом оставляет больше места для двора, а в одноэтажном нет лестницы — так удобнее пожилым и маленьким детям.`,
        });
    } else {
      out.push({
        q: `Какой участок нужен для ${subject}?`,
        a: `Проекты на этой странице рассчитаны на ${x.sotixMin === x.sotixMax ? `участок в ${sotix(x.sotixMin, locale)}` : `участки от ${f(x.sotixMin)} до ${f(x.sotixMax)} ${sotokGen(x.sotixMax)}`}.${x.narrowest ? ` Самый узкий участок нужен для проекта ${named(x.narrowest, locale)} — шириной от ${f(x.narrowest.minPlotWidth)} м.` : ""}`,
      });
    }
    out.push({
      q: `Сколько стоит проект ${subject}?`,
      a: `${x.count > 1 ? `Цены на ${projects(x.count, locale)} — от ${f(x.priceMin)} до ${f(x.priceMax)} сум. Самый доступный — ${named(x.cheapest, locale)}.` : `Проект ${named(x.cheapest, locale)} стоит ${f(x.priceMin)} сум.`} В цену входит проектная документация, строительные работы — нет.`,
    });
    out.push({
      q: `Сколько стоит построить ${ruAcc(subject)}?`,
      a: "Это зависит от площади дома, этажности, материалов стен и отделки. Посчитайте в нашем калькуляторе стоимости строительства: он шаг за шагом разбирает каждую статью — от фундамента до отделки.",
    });
    out.push({
      q: "Можно ли изменить проект под мой участок?",
      a: "Если готовый проект не подходит, Castler разработает индивидуальный проект с нуля — под ваш участок, семью и бюджет.",
    });
    out.push({
      q: "Как заказать проект?",
      a: `Откройте понравившийся проект и оставьте имя и телефон через кнопку «Обсудить проект» или позвоните по номеру ${settings.phone} — специалист Castler свяжется с вами.`,
    });
    return out;
  }

  if (c.group === "plot") {
    out.push({
      q: `${n} sotix necha kvadrat metr?`,
      a: `${n} sotix — ${f(n * 100)} m². 1 sotix 100 m² ga teng, masalan 10 × 10 m yer.`,
    });
    out.push({
      q: `${n} sotix yerga qanday uy sig'adi?`,
      a: `Katalogda ${n} sotixgacha yerga mo'ljallangan ${projects(x.count, locale)} bor: ${list}.${x.narrowest ? ` Eng tor yerga sig'adigani — ${named(x.narrowest, locale)}: yer eni kamida ${f(x.narrowest.minPlotWidth)} m.` : ""}`,
    });
    if (ones && twos)
      out.push({
        q: `${n} sotixga 1 qavatli uy yaxshimi yoki 2 qavatli?`,
        a: `Bu ro'yxatda ${ones} ta 1 qavatli va ${twos} ta 2 qavatli loyiha bor. Kichik yerda 2 qavatli uy hovli uchun ko'proq joy qoldiradi, 1 qavatli uyda esa zinapoya yo'q — keksalar va kichik bolalar uchun qulay.`,
      });
  } else {
    out.push({
      q: `${cap(subject)} uchun qancha yer kerak?`,
      a: `Bu sahifadagi loyihalar ${uzRange(x.sotixMin, x.sotixMax, "sotix")} yerga mo'ljallangan.${x.narrowest ? ` Eng tor yerga sig'adigani — ${named(x.narrowest, locale)}: yer eni kamida ${f(x.narrowest.minPlotWidth)} m.` : ""}`,
    });
  }
  out.push({
    q: `${cap(subject)} loyihasi qancha turadi?`,
    a: `${x.count > 1 ? `${projects(x.count, locale)}ning narxi ${uzRange(x.priceMin, x.priceMax, "so'm")}. Eng arzoni — ${named(x.cheapest, locale)}.` : `${named(x.cheapest, locale)} loyihasi narxi — ${f(x.priceMin)} so'm.`} Narxga loyiha hujjatlari kiradi, qurilish ishlari kirmaydi.`,
  });
  out.push({
    q: `${cap(subject)} qurish qancha turadi?`,
    a: "Bu uy maydoni, qavatlar soni, devor materiali va pardozga bog'liq. Uy qurish narxi kalkulyatorimizda hisoblang: u poydevordan pardozgacha har bir ishni alohida ko'rsatadi.",
  });
  out.push({
    q: "Loyihani o'z yerimga moslashtirsa bo'ladimi?",
    a: "Tayyor loyiha mos kelmasa, Castler yeringiz, oilangiz va byudjetingiz uchun noldan individual loyiha tayyorlaydi.",
  });
  out.push({
    q: "Loyihani qanday buyurtma qilsa bo'ladi?",
    a: `Yoqqan loyihani oching va «Loyihani muhokama qilish» tugmasi orqali ism va telefon raqamingizni qoldiring yoki ${settings.phone} raqamiga qo'ng'iroq qiling — Castler mutaxassisi siz bilan bog'lanadi.`,
  });
  return out;
}
