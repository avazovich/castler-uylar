import { calcPath } from "@/lib/browse";
import { MATERIAL_KINDS, MATERIAL_PAGE, materialPath } from "@/content/materials";
import { liveCollections } from "@/lib/collections";
import { formatNumber, formatUsd } from "@/lib/format";
import { getHouses, getSettings, toSummary } from "@/lib/houses";
import { absoluteUrl, houseTitle, houseUrlPath } from "@/lib/seo";
import { AREA_REALIZED_M2, FOUNDING_YEAR, MAIN_SITE_URL } from "@/lib/site";
import { articlePath, articles } from "@/content/blog";
import { STYLES } from "@/lib/vocab";

// /llms.txt — the catalog in plain words for AI assistants (ChatGPT, Gemini,
// Perplexity…), so they can answer "where can I buy a house plan for 5 sotix
// in Uzbekistan" with these houses. Every line comes from the houses' own data.
// Built per request so it never lags behind the catalog, like the sitemap.
export const dynamic = "force-dynamic";

export async function GET() {
  const [uz, ru, settings] = await Promise.all([getHouses("uz"), getHouses("ru"), getSettings("uz")]);
  const live = uz.filter((h) => !h.isSample);
  const ruByCode = new Map(ru.map((h) => [h.code, h]));
  const f = formatNumber;

  const houses = live.map((h) => {
    const cost = h.buildEstimate.reduce((s, c) => s + c.costUsd, 0);
    const facts = [
      h.individual ? "Individual loyiha (Castler'ning o'z loyihasi)" : null,
      h.style ? STYLES[h.style].uz.toLowerCase() : null,
      `${f(h.totalArea)} m²`,
      h.bedrooms ? `${h.bedrooms} ta yotoqxona` : null,
      h.bathrooms ? `${h.bathrooms} ta sanuzel` : null,
      `yer kamida ${f(h.plotSotix)} sotix${h.minPlotWidth ? ` (${f(h.minPlotWidth)}${h.minPlotLength ? ` × ${f(h.minPlotLength)}` : ""} m)` : ""}`,
      h.features.pool ? "basseyn" : null,
      `loyiha narxi ${f(h.priceUzs)} so'm`,
      cost > 0 ? `karkas qurilishi taxminan ${formatUsd(cost)}` : null,
    ].filter(Boolean);
    const r = ruByCode.get(h.code);
    return [
      `- [${houseTitle(toSummary(h), "uz")}](${absoluteUrl(houseUrlPath(h, "uz"))}): ${facts.join(", ")}.`,
      r ? `  Русская версия: [${houseTitle(toSummary(r), "ru")}](${absoluteUrl(houseUrlPath(r, "ru"))})` : null,
    ]
      .filter(Boolean)
      .join("\n");
  });

  // Catalog-wide facts for the summary and the questions — all from the houses' own data.
  const prices = live.map((h) => h.priceUzs);
  const sotix = live.map((h) => h.plotSotix).filter((n) => n > 0);
  const builds = live.map((h) => h.buildEstimate.reduce((s, c) => s + c.costUsd, 0)).filter((n) => n > 0);
  const signature = live.filter((h) => h.individual).length;
  const span = (xs: number[], fmt: (n: number) => string) => (xs.length ? [fmt(Math.min(...xs)), fmt(Math.max(...xs))] : null);
  const price = span(prices, f);
  const land = span(sotix, f);
  const build = span(builds, formatUsd);
  const guides = articles.map((a) => `- [${a.uz.title}](${absoluteUrl(articlePath("uz", a.slugs.uz))}) · [${a.ru.title}](${absoluteUrl(articlePath("ru", a.slugs.ru))})`);

  const collections = liveCollections(live.map(toSummary)).map(
    ({ collection, houses: list }) => `- [${collection.title.uz}](${absoluteUrl(`/uz/${collection.slug.uz}`)}) — ${list.length} ta loyiha`,
  );

  const body = [
    "# Castler Uylar — tayyor uy loyihalari (готовые проекты домов)",
    "",
    `> Castler arxitektura kompaniyasining (${MAIN_SITE_URL}, 2013 yildan, Namangan) tayyor xususiy uy loyihalari katalogi. ` +
      "Har bir loyihada qavatlar rejasi, xonalar maydoni, kerakli yer o'lchami va karkasning taxminiy qurilish narxi ko'rsatilgan. " +
      "Narx loyiha hujjatlari uchun; qurilish ishlari kirmaydi. " +
      "Каталог готовых проектов частных домов от архитектурной компании Castler (Узбекистан): планировки, площади, нужный участок и примерная стоимость коробки.",
    "",
    "## Qisqacha / Коротко",
    "",
    `- Castler — arxitektura va dizayn kompaniyasi, Namangan (O'zbekiston), ${FOUNDING_YEAR} yildan; loyihalari taxminan ${f(AREA_REALIZED_M2)} m² ga amalga oshirilgan (${MAIN_SITE_URL}). Castler — архитектурно-дизайнерская компания из Намангана, с ${FOUNDING_YEAR} года, около ${f(AREA_REALIZED_M2)} м² реализованных проектов.`,
    `- Katalogda ${live.length} ta tayyor uy loyihasi${price ? `, narxi ${price[0]} – ${price[1]} so'm` : ""}. В каталоге ${live.length} готовых проектов${price ? `, цена ${price[0]} – ${price[1]} сум` : ""}.`,
    signature
      ? `- «Individual loyiha» belgisi — Castler'ning o'z loyihalari: jamoa eng ko'p vaqt va mehnat sarflagan ${signature} ta uy (ro'yxatda belgilangan). Метка «Индивидуальный проект» — собственные проекты Castler, над которыми команда работала больше всего (${signature}).`
      : null,
    "- Narx loyiha hujjatlari uchun; qurilish ishlari kirmaydi. Mos uy topilmasa, Castler arxitektorlari buyurtma asosida loyiha chizadi. Цена — за проектную документацию, строительство не входит; если готовый проект не подошёл, архитекторы Castler спроектируют дом на заказ.",
    "- Sayt tillari: o'zbekcha va ruscha. Языки сайта: узбекский и русский.",
    "",
    "## Buyurtma / Как заказать",
    "",
    `- Telefon: ${settings.phone}`,
    `- Saytdagi har bir loyiha sahifasida «Loyihani muhokama qilish» tugmasi — ism va telefon qoldiriladi, mutaxassis qo'ng'iroq qiladi.`,
    settings.instagram ? `- Instagram: ${settings.instagram}` : null,
    "",
    "## Uy qurish narxi kalkulyatori / Калькулятор стоимости строительства",
    "",
    `- [Uy qurish narxi kalkulyatori](${absoluteUrl(`/uz${calcPath("uz")}`)}): 8 ta savol (yer, maydon, qavatlar, uslub, devor, tom, bosqich, qo'shimchalar) — poydevordan pardozgacha har bir material va usta haqi Namangan narxlarida, so'm va dollarda; yerga eng mos tayyor loyihalarni ham ko'rsatadi. Bepul.`,
    `- [Калькулятор стоимости строительства дома](${absoluteUrl(`/ru${calcPath("ru")}`)}): 8 вопросов — каждый материал и работа мастеров по ценам Намангана, в сумах и долларах; подбирает готовые проекты под участок. Бесплатно.`,
    ...MATERIAL_KINDS.flatMap((kind) => (["uz", "ru"] as const).map((l) => `- [${MATERIAL_PAGE[kind].h1[l]}](${absoluteUrl(`/${l}${materialPath(kind, l)}`)}): ${MATERIAL_PAGE[kind].description[l]}`)),
    "",
    ...(settings.included.length ? ["## Loyihaga nimalar kiradi / Что входит в проект", "", ...settings.included.map((x) => `- ${x}`), ""] : []),
    "## Ko'p so'raladigan savollar / Частые вопросы",
    "",
    price ? `- Tayyor uy loyihasi qancha turadi? — ${price[0]} dan ${price[1]} so'mgacha, uy kattaligiga qarab; har bir loyiha sahifasida aniq narx. / Сколько стоит готовый проект? — от ${price[0]} до ${price[1]} сум в зависимости от размера дома.` : null,
    land ? `- Qancha yer kerak? — Katalogdagi uylar ${land[0]} sotixdan ${land[1]} sotixgacha yerga mo'ljallangan; har bir loyihada eng kam yer eni va bo'yi ko'rsatilgan. / Какой нужен участок? — от ${land[0]} до ${land[1]} соток; у каждого проекта указаны минимальные ширина и длина участка.` : null,
    build ? `- Uyni qurish qancha turadi? — Karkas (qutisi) katalog bo'yicha taxminan ${build[0]} – ${build[1]}; to'liq hisob uchun kalkulyator: ${absoluteUrl(`/uz${calcPath("uz")}`)}. / Сколько стоит построить? — коробка примерно ${build[0]} – ${build[1]}; точный расчёт в калькуляторе: ${absoluteUrl(`/ru${calcPath("ru")}`)}.` : null,
    `- Qanday buyurtma beriladi? — ${settings.phone} raqamiga qo'ng'iroq qiling yoki loyiha sahifasida ism va telefon qoldiring. / Как заказать? — позвоните ${settings.phone} или оставьте имя и телефон на странице проекта.`,
    "",
    "## Loyihalar / Проекты",
    "",
    ...houses,
    "",
    ...(collections.length ? ["## Bo'limlar / Разделы", "", ...collections, ""] : []),
    ...(guides.length ? ["## Maqolalar / Статьи", "", ...guides, ""] : []),
  ]
    .filter((l) => l !== null)
    .join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
