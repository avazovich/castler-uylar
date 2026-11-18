import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { MATERIAL_KINDS, MATERIAL_PAGE, MATERIAL_TEXT, MATERIAL_UI, materialPath } from "@/content/materials";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { calcPath } from "@/lib/browse";
import {
  BLOCKS_PER_M2, BLOCKS_PER_M3, BLOCK_SIZE, BLOCK_THICKNESSES, BRICKS_PER_M2, BRICKS_PER_M3, BRICK_SIZE, BRICK_THICKNESSES, CEMENT_BAG_KG, GRADES,
  blockWall, brickWall, concrete, mixPerM3, type MaterialKind,
} from "@/lib/buildCost/materials";
import { PRICES, PRICES_AS_OF } from "@/lib/buildCost/prices";
import { getUsdRate } from "@/lib/buildCost/usdRate";
import { formatNumber as f } from "@/lib/format";
import { absoluteUrl, breadcrumbLd, faqLd, pageMetadata, type Faq } from "@/lib/seo";
import { MAIN_SITE_URL } from "@/lib/site";
import { JsonLd } from "./JsonLd";
import { MaterialCalculator } from "./MaterialCalculator";
import { PageHeader } from "./PageHeader";

/**
 * The brick, gas-block and concrete calculator pages. Under the calculator:
 * a table of the standard figures and answers to the questions people search,
 * every number worked out by lib/buildCost/materials.ts — so the text and the
 * calculator always agree.
 */

export function materialMetadata(kind: MaterialKind, locale: Locale): Metadata {
  const page = MATERIAL_PAGE[kind];
  return pageMetadata(locale, (l) => `/${l}${materialPath(kind, l)}`, page.title[locale], page.description[locale]);
}

/** Cost of 1 m² of wall, from a 100 m² wall so rounding up of bags doesn't distort it. */
const per100 = (uzs: number) => Math.round(uzs / 100 / 1000) * 1000;
const WALL_100 = { length: 100, height: 1, openings: 0 };

function faqFor(kind: MaterialKind, locale: Locale, som: string): Faq[] {
  const ru = locale === "ru";
  const money = (uzs: number) => `${f(Math.round(uzs / 1000) * 1000)} ${som}`;
  if (kind === "brick") {
    const [half, one, oneHalf, two] = BRICK_THICKNESSES.map((t) => BRICKS_PER_M2[t]);
    const m2 = brickWall(WALL_100, 1.5);
    const labour = PRICES.bricklaying.uzs;
    return ru
      ? [
          { q: "Сколько кирпича в 1 м² кладки?", a: `Для кирпича ${BRICK_SIZE} мм со швами 10 мм: стена в полкирпича (12 см) — ${half} шт, в 1 кирпич (25 см) — ${one}, в 1,5 кирпича (38 см) — ${oneHalf}, в 2 кирпича (51 см) — ${two} шт. Добавьте 5 % на бой.` },
          { q: "Сколько кирпича в 1 м³ кладки?", a: `Около ${BRICKS_PER_M3} штук с учётом швов раствора.` },
          { q: "Какой размер у кирпича?", a: `Стандартный жжёный кирпич — ${BRICK_SIZE} мм. Калькулятор считает по этому размеру.` },
          { q: "Сколько стоит 1 м² кирпичной стены?", a: `Стена в 1,5 кирпича по ценам Намангана: около ${money(per100(m2.totalUzs))} за 1 м² — кирпич, цемент, песок и работа мастера. Без работы — ${money(per100(m2.materialsUzs))}.` },
          { q: "Сколько стоит кладка кирпича?", a: `Калькулятор считает работу поштучно: около ${f(labour)} сум за кирпич (ориентировочно, Наманган). 1 м² стены в 1,5 кирпича — около ${money(per100(m2.labourUzs))}.` },
        ]
      : [
          { q: "1 m² devorga nechta g‘isht ketadi?", a: `${BRICK_SIZE} mm g‘isht, 10 mm chok bilan: yarim g‘isht devor (12 sm) — ${half} dona, 1 g‘isht (25 sm) — ${one}, 1,5 g‘isht (38 sm) — ${oneHalf}, 2 g‘isht (51 sm) — ${two} dona. Sinishiga 5 % qo‘shing.` },
          { q: "1 m³ devorga nechta g‘isht ketadi?", a: `Choklari bilan taxminan ${BRICKS_PER_M3} dona.` },
          { q: "G‘isht o‘lchami qancha?", a: `Standart pishgan g‘isht — ${BRICK_SIZE} mm. Kalkulyator shu o‘lcham bo‘yicha hisoblaydi.` },
          { q: "1 m² g‘isht devor qancha turadi?", a: `1,5 g‘isht qalinlikdagi devor Namangan narxlarida: 1 m² taxminan ${money(per100(m2.totalUzs))} — g‘isht, sement, qum va usta haqi bilan. Usta haqisiz — ${money(per100(m2.materialsUzs))}.` },
          { q: "G‘isht terish narxi qancha?", a: `Kalkulyator usta haqini dona hisobida oladi: 1 g‘isht — taxminan ${f(labour)} so‘m (Namangan). 1,5 g‘isht devorda 1 m² uchun — taxminan ${money(per100(m2.labourUzs))}.` },
        ];
  }
  if (kind === "block") {
    const [m20, m30] = BLOCK_THICKNESSES.map((t) => f(Math.round(BLOCKS_PER_M2[t] * 10) / 10));
    const perM3 = f(Math.round(BLOCKS_PER_M3 * 10) / 10);
    const block = blockWall(WALL_100, 30);
    const brick = brickWall(WALL_100, 1.5);
    const price = PRICES.gasblock.uzs;
    return ru
      ? [
          { q: "Сколько газоблока в 1 м³?", a: `Блоков ${BLOCK_SIZE} мм в кубе — ${perM3} шт (один блок — 0,036 м³).` },
          { q: "Сколько газоблока в 1 м² стены?", a: `Стена 20 см — ${m20} блока на 1 м², стена 30 см — ${m30}. Добавьте 5 % на подрезку и бой.` },
          { q: "Какой размер у газоблока?", a: `Самый ходовой — ${BLOCK_SIZE} мм. Калькулятор считает по этому размеру.` },
          { q: "Сколько стоит газоблок?", a: `В Намангане — около ${f(price)} сум за блок ${BLOCK_SIZE} (на OLX от 9 000 до 16 000), то есть около ${f(Math.round((BLOCKS_PER_M3 * price) / 1000) * 1000)} сум за 1 м³.` },
          { q: "Газоблок или кирпич — что дешевле?", a: `1 м² стены из газоблока 30 см с работой — около ${f(per100(block.totalUzs))} сум, из кирпича в 1,5 кирпича (38 см) — около ${f(per100(brick.totalUzs))} сум. Кирпич прочнее и привычнее, газоблок легче и лучше держит тепло.` },
        ]
      : [
          { q: "1 m³ da nechta gazoblok bor?", a: `${BLOCK_SIZE} mm blokdan 1 kubda ${perM3} dona (bitta blok — 0,036 m³).` },
          { q: "1 m² devorga nechta gazoblok ketadi?", a: `20 sm devor — 1 m² ga ${m20} dona, 30 sm devor — ${m30} dona. Kesish va sinishiga 5 % qo‘shing.` },
          { q: "Gazoblok o‘lchami qancha?", a: `Eng ko‘p ishlatiladigani — ${BLOCK_SIZE} mm. Kalkulyator shu o‘lchamda hisoblaydi.` },
          { q: "Gazoblok narxi qancha?", a: `Namanganda ${BLOCK_SIZE} blok taxminan ${f(price)} so‘m (OLX’da 9 000–16 000), ya’ni 1 m³ taxminan ${f(Math.round((BLOCKS_PER_M3 * price) / 1000) * 1000)} so‘m.` },
          { q: "Gazoblok yoki g‘isht — qaysi biri arzon?", a: `Usta haqi bilan 1 m² devor: 30 sm gazoblokdan — taxminan ${f(per100(block.totalUzs))} so‘m, 1,5 g‘isht (38 sm) dan — taxminan ${f(per100(brick.totalUzs))} so‘m. G‘isht mustahkam va odatiy, gazoblok yengil va issiqni yaxshi saqlaydi.` },
        ];
  }
  const [m200, m250, m300] = GRADES.map((g) => mixPerM3(g));
  const bagM3 = (cementKg: number) => f(Math.round((CEMENT_BAG_KG / cementKg) * 100) / 100);
  const example = concrete({ shape: "strip", length: 44, width: 0.4, depth: 1.2, grade: "M250" });
  return ru
    ? [
        { q: "Сколько цемента нужно на 1 куб бетона?", a: `На цементе М400: М200 — ${m200.cementKg} кг (${f(m200.bags)} мешка), М250 — ${m250.cementKg} кг (${f(m250.bags)}), М300 — ${m300.cementKg} кг (${f(m300.bags)}).` },
        { q: "Пропорции бетона: цемент, песок, щебень", a: `По массе: М200 — ${m200.ratio}, М250 — ${m250.ratio}, М300 — ${m300.ratio}. Для 1 м³ М250: ${m250.cementKg} кг цемента, ${f(m250.sandM3)} м³ песка, ${f(m250.gravelM3)} м³ щебня и около ${m250.waterL} л воды.` },
        { q: "Сколько бетона получится из мешка цемента?", a: `Из одного мешка 50 кг: М200 — около ${bagM3(m200.cementKg)} м³, М250 — ${bagM3(m250.cementKg)} м³, М300 — ${bagM3(m300.cementKg)} м³.` },
        { q: "Сколько бетона нужно на фундамент?", a: `Например, ленточный фундамент под наружные стены дома 10 × 12 м: 44 м × 0,4 м × 1,2 м = ${f(example.volume)} м³; заказывайте ${f(example.order)} м³ с запасом 5 %.` },
        { q: "Готовый бетон или замес на месте?", a: `Для этого фундамента из М250 по ценам Намангана: готовый бетон с арматурой и работой — около ${f(Math.round((example.ready?.totalUzs ?? 0) / 1e5) / 10)} млн сум, замес на месте — около ${f(Math.round(example.selfMix.totalUzs / 1e5) / 10)} млн сум. Заводской бетон ровнее по качеству и экономит время.` },
      ]
    : [
        { q: "1 kub betonga qancha sement ketadi?", a: `M400 sementda: M200 — ${m200.cementKg} kg (${f(m200.bags)} qop), M250 — ${m250.cementKg} kg (${f(m250.bags)} qop), M300 — ${m300.cementKg} kg (${f(m300.bags)} qop).` },
        { q: "Beton tarkibi qanday: sement, qum, shag‘al?", a: `Og‘irlik bo‘yicha: M200 — ${m200.ratio}, M250 — ${m250.ratio}, M300 — ${m300.ratio}. 1 m³ M250 uchun: ${m250.cementKg} kg sement, ${f(m250.sandM3)} m³ qum, ${f(m250.gravelM3)} m³ shag‘al va taxminan ${m250.waterL} l suv.` },
        { q: "Bir qop sementdan qancha beton chiqadi?", a: `50 kg li bir qopdan: M200 — taxminan ${bagM3(m200.cementKg)} m³, M250 — ${bagM3(m250.cementKg)} m³, M300 — ${bagM3(m300.cementKg)} m³.` },
        { q: "Poydevorga qancha beton kerak?", a: `Masalan, 10 × 12 m uyning tashqi devorlari ostidagi lenta poydevor: 44 m × 0,4 m × 1,2 m = ${f(example.volume)} m³; 5 % zaxira bilan ${f(example.order)} m³ buyurtma qiling.` },
        { q: "Tayyor beton yoki o‘zimiz aralashtiramizmi?", a: `Shu poydevor M250 dan, Namangan narxlarida: tayyor beton armatura va usta haqi bilan — taxminan ${f(Math.round((example.ready?.totalUzs ?? 0) / 1e5) / 10)} mln so‘m, o‘zingiz aralashtirsangiz — taxminan ${f(Math.round(example.selfMix.totalUzs / 1e5) / 10)} mln so‘m. Zavod betoni sifati bir xil va vaqtni tejaydi.` },
      ];
}

export async function MaterialPage({ kind, locale: raw, slugLocale }: { kind: MaterialKind; locale: string; slugLocale: Locale }) {
  if (!hasLocale(routing.locales, raw)) notFound();
  const locale: Locale = raw;
  if (locale !== slugLocale) permanentRedirect(`/${locale}${materialPath(kind, locale)}`);
  setRequestLocale(locale);

  const [nav, browse, usd] = await Promise.all([getTranslations("nav"), getTranslations("browse"), getUsdRate()]);
  const page = MATERIAL_PAGE[kind];
  const text = MATERIAL_TEXT[locale];
  const ui = MATERIAL_UI[locale];
  const som = ui.som;
  const faq = faqFor(kind, locale, som);
  const path = `/${locale}${materialPath(kind, locale)}`;
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: page.h1[locale],
    description: page.description[locale],
    url: absoluteUrl(path),
    inLanguage: locale,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: 0, priceCurrency: "UZS" },
    provider: { "@type": "Organization", name: "Castler", url: MAIN_SITE_URL },
  };

  const th = "px-4 py-3 font-semibold";
  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: nav("home"), path: `/${locale}` }, { name: browse("cost"), path: `/${locale}${calcPath(locale)}` }, { name: page.h1[locale], path }]), app, faqLd(faq)]} />
      <PageHeader title={page.h1[locale]} subtitle={page.intro[locale]}
        crumbs={[{ label: nav("home"), href: "/" }, { label: browse("cost"), href: calcPath(locale) }, { label: page.h1[locale] }]} />

      <section className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-12">
        <MaterialCalculator kind={kind} locale={locale} rate={usd.rate} priceDate={PRICES_AS_OF[locale]} />
      </section>

      <section className="border-t border-line bg-cream/60">
        <div className="mx-auto grid max-w-[920px] grid-cols-[minmax(0,1fr)] gap-12 px-4 py-14 md:px-8 md:py-20">
          <div>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-ink">{text.refTitle[kind]}</h2>
            <div className="mt-6 overflow-x-auto rounded-xl border border-line bg-paper">
              <table className="w-full min-w-[520px] text-left text-[15px]">
                <thead className="border-b border-line bg-cream/70 text-[13px] uppercase tracking-wider text-ink-soft">
                  {kind === "concrete" ? (
                    <tr>
                      <th scope="col" className={th}>{text.grade}</th>
                      <th scope="col" className={`${th} text-right`}>{ui.cement}</th>
                      <th scope="col" className={`${th} text-right`}>{ui.sand}</th>
                      <th scope="col" className={`${th} text-right`}>{ui.gravel}</th>
                      <th scope="col" className={`${th} text-right`}>{ui.water}</th>
                      <th scope="col" className={`${th} text-right`}>{text.readyM3}</th>
                    </tr>
                  ) : (
                    <tr>
                      <th scope="col" className={th}>{text.thickness}</th>
                      <th scope="col" className={`${th} text-right`}>{text.perM2}</th>
                      <th scope="col" className={`${th} text-right`}>{text.costM2}</th>
                    </tr>
                  )}
                </thead>
                <tbody className="tabular-nums">
                  {kind === "brick" && BRICK_THICKNESSES.map((t) => (
                    <tr key={t} className="border-b border-line last:border-b-0">
                      <th scope="row" className="px-4 py-3 font-semibold text-ink">{ui.brickThickness[t]}</th>
                      <td className="px-4 py-3 text-right">{BRICKS_PER_M2[t]} {locale === "ru" ? "шт" : "dona"}</td>
                      <td className="px-4 py-3 text-right">{f(per100(brickWall(WALL_100, t).totalUzs))} {som}</td>
                    </tr>
                  ))}
                  {kind === "block" && BLOCK_THICKNESSES.map((t) => (
                    <tr key={t} className="border-b border-line last:border-b-0">
                      <th scope="row" className="px-4 py-3 font-semibold text-ink">{ui.blockThickness[t]}</th>
                      <td className="px-4 py-3 text-right">{f(Math.round(BLOCKS_PER_M2[t] * 10) / 10)} {locale === "ru" ? "шт" : "dona"}</td>
                      <td className="px-4 py-3 text-right">{f(per100(blockWall(WALL_100, t).totalUzs))} {som}</td>
                    </tr>
                  ))}
                  {kind === "concrete" && GRADES.map((g) => {
                    const m = mixPerM3(g);
                    const readyId = g === "M250" ? "concreteM250" : g === "M300" ? "concreteM300" : null;
                    return (
                      <tr key={g} className="border-b border-line last:border-b-0">
                        <th scope="row" className="px-4 py-3 font-semibold text-ink">{g}<span className="block text-[12.5px] font-normal text-ink-soft">{m.ratio}</span></th>
                        <td className="px-4 py-3 text-right">{m.cementKg} {ui.kg}<span className="block text-[12.5px] text-ink-soft">{f(m.bags)} {ui.bag}</span></td>
                        <td className="px-4 py-3 text-right">{f(m.sandM3)} {ui.m3}</td>
                        <td className="px-4 py-3 text-right">{f(m.gravelM3)} {ui.m3}</td>
                        <td className="px-4 py-3 text-right">{m.waterL} {ui.litre}</td>
                        <td className="px-4 py-3 text-right">{readyId ? `${f(PRICES[readyId].uzs)} ${som}` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[13px] text-ink-soft">
              {kind === "brick" && (locale === "ru" ? `Кирпич ${BRICK_SIZE} мм, швы 10 мм. ` : `G‘isht ${BRICK_SIZE} mm, chok 10 mm. `)}
              {kind === "block" && (locale === "ru" ? `Блок ${BLOCK_SIZE} мм; в 1 м³ — ${f(Math.round(BLOCKS_PER_M3 * 10) / 10)} шт. ` : `Blok ${BLOCK_SIZE} mm; 1 m³ da ${f(Math.round(BLOCKS_PER_M3 * 10) / 10)} dona. `)}
              {kind === "concrete" && (locale === "ru" ? "Цемент М400, пропорции по массе. " : "Sement M400, nisbat og‘irlik bo‘yicha. ")}
              {ui.note.replace("{date}", PRICES_AS_OF[locale])}
            </p>
          </div>

          <div>
            <h2 className="font-display text-[clamp(1.6rem,4vw,2.4rem)] leading-tight text-ink">{text.faqTitle}</h2>
            <div className="mt-6 grid gap-3">
              {faq.map((item) => (
                <details key={item.q} className="rounded-xl border border-line bg-paper px-5 py-4">
                  <summary className="cursor-pointer font-semibold text-ink">{item.q}</summary>
                  <p className="mt-3 leading-relaxed text-ink-soft">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          <nav aria-label={text.otherTitle}>
            <h2 className="font-display text-[clamp(1.4rem,3vw,1.9rem)] leading-tight text-ink">{text.otherTitle}</h2>
            <ul className="mt-4 flex flex-wrap gap-2">
              {MATERIAL_KINDS.filter((k) => k !== kind).map((k) => (
                <li key={k}>
                  <Link href={materialPath(k, locale)} className="block rounded-full border border-line bg-paper px-4 py-2.5 text-ink hover:border-ink">{MATERIAL_PAGE[k].h1[locale]}</Link>
                </li>
              ))}
              <li>
                <Link href={calcPath(locale)} className="block rounded-full border border-line bg-paper px-4 py-2.5 text-ink hover:border-ink">{ui.houseCalc}</Link>
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </>
  );
}
