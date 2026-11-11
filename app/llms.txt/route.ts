import { liveCollections } from "@/lib/collections";
import { formatNumber, formatUsd } from "@/lib/format";
import { getHouses, getSettings, toSummary } from "@/lib/houses";
import { absoluteUrl, houseTitle, houseUrlPath } from "@/lib/seo";
import { MAIN_SITE_URL } from "@/lib/site";
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
    "## Buyurtma / Как заказать",
    "",
    `- Telefon: ${settings.phone}`,
    `- Saytdagi har bir loyiha sahifasida «Loyihani muhokama qilish» tugmasi — ism va telefon qoldiriladi, mutaxassis qo'ng'iroq qiladi.`,
    settings.instagram ? `- Instagram: ${settings.instagram}` : null,
    "",
    ...(settings.included.length ? ["## Loyihaga nimalar kiradi / Что входит в проект", "", ...settings.included.map((x) => `- ${x}`), ""] : []),
    "## Loyihalar / Проекты",
    "",
    ...houses,
    "",
    ...(collections.length ? ["## Bo'limlar / Разделы", "", ...collections, ""] : []),
  ]
    .filter((l) => l !== null)
    .join("\n");

  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
