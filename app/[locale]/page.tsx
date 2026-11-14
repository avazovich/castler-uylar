import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BuildEstimate } from "@/components/BuildEstimate";
import { FinderForm } from "@/components/FinderForm";
import { JsonLd } from "@/components/JsonLd";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { browsePath } from "@/lib/browse";
import { collectionHref, liveCollections } from "@/lib/collections";
import { formatNumber } from "@/lib/format";
import { getHouses, getSettings, toSummary } from "@/lib/houses";
import { houseAlt, housePath, organizationLd, pageMetadata, websiteLd } from "@/lib/seo";
import { STYLES } from "@/lib/vocab";

type Props = { params: Promise<{ locale: string }> };
type Entry = { title: string; text: string };
export const revalidate = 60;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return pageMetadata(locale as Locale, (language) => `/${language}`, t("title"), t("description"));
}

export default async function HomePage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const [t, home, browse, meta, common, houses, settings] = await Promise.all([
    getTranslations("referenceHome"), getTranslations("home"), getTranslations("browse"),
    getTranslations("meta"), getTranslations("common"), getHouses(locale), getSettings(locale),
  ]);
  const picked = [...houses].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 6);
  const categories = liveCollections(houses.map(toSummary));
  const styles = categories.filter(({ collection }) => collection.group === "style");
  const tiles = [...styles, ...categories.filter(({ collection }) => collection.group !== "style")].slice(0, 6);
  const guide = home.raw("guide") as Entry[];
  const steps = home.raw("steps") as Entry[];
  const faq = browse.raw("faqItems") as Entry[];
  const floors = [...new Set(houses.map(({ floors }) => floors))].sort((a, b) => a - b);
  const consult = browsePath("consult");
  const contact = settings.telegram ? `https://t.me/${settings.telegram}` : undefined;

  return (
    <div className="reference-home">
      <JsonLd data={[organizationLd(settings, locale), websiteLd(locale, meta("siteName"))]} />
      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">{t("heroLabel")}</p>
          <h1>{t("heroTitle")}</h1>
          <FinderForm floorOptions={floors} />
          <div className="chips">
            <Link href="/loyihalar">⌂ {home("allProjects")}</Link>
            {styles.slice(0, 2).map(({ collection }) => <Link key={collection.id} href={collectionHref(collection, locale)}>{collection.short[locale]}</Link>)}
            <Link href="/loyihalar?sotix=5">{browse("compactPlot")}</Link>
            {categories.filter(({ collection }) => collection.id === "floors-1").map(({ collection }) =>
              <Link key={collection.id} href={collectionHref(collection, locale)}>{collection.short[locale]}</Link>)}
          </div>
        </div>
      </section>
      <div className="strip"><div className="wrap">
        <p><strong>{t("help")}</strong> {t("helpText")}</p><Link href={consult}>{t("contact")} →</Link>
      </div></div>

      {tiles.length > 0 && <section className="wrap section" id="uslublar">
        <p className="eyebrow">{t("start")}</p><h2>{t("styleTitle")}</h2><p className="intro">{t("styleIntro")}</p>
        <div className="collections">
          {tiles.map(({ collection, houses: [house] }) => (
            <Link key={collection.id} className="collection" href={collectionHref(collection, locale)}>
              <Image src={house.cover.url} alt="" fill sizes="(min-width: 980px) 210px, 33vw" />
              <strong>{collection.short[locale]} →</strong>
            </Link>
          ))}
        </div>
        <div className="inline-links">
          <Link href={browsePath("styles")}>{browse("styles")} →</Link>
          <Link href={browsePath("collections")}>{browse("collections")}</Link>
          <Link href={browsePath("size")}>{browse("size")}</Link>
        </div>
      </section>}

      {settings.included.length > 0 && <section className="band" id="hujjatlar"><div className="wrap section">
        <h2>{t("docsTitle")}</h2>
        <ul className="document-list comparison">{settings.included.map((item) => <li key={item}>{item}</li>)}</ul>
        <Link className="button" href={consult}>{t("docAction")} →</Link>
      </div></section>}

      <section className="wrap section" id="loyihalar">
        <p className="eyebrow">{t("picks")}</p><h2>{home("featuredTitle")}</h2><p className="intro">{t("picksIntro")}</p>
        <div className="cards">
          {picked.map((house) => (
            <article key={house.code} className="card">
              <Link href={housePath(house, locale)}>
                <div className="photo-frame"><Image src={house.cover.url} alt={houseAlt(house, locale)} fill sizes="(min-width: 690px) 33vw, 50vw" /></div>
                <div className="card-body">
                  {house.style && <p className="tag">{STYLES[house.style][locale]}{house.isSample ? ` · ${common("sample")}` : ""}</p>}
                  <h3>№{house.code} · {house.name}</h3><strong>{common("price", { amount: formatNumber(house.priceUzs) })}</strong>
                  <p>{formatNumber(house.totalArea)} m² · {common("floors", { count: house.floors, label: formatNumber(house.floors) })}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>
        <Link className="button more" href="/loyihalar">{home("allProjects")} →</Link>
      </section>

      <section className="band" id="xarajat"><div className="wrap section">
        <p className="eyebrow">{browse("cost")}</p><h2>{t("costTitle")}</h2><p className="intro">{browse("costIntro")}</p>
        <div className="cost">
          <div><h3>{t("costFactors")}</h3><ul className="consult-list">{(t.raw("factors") as string[]).map((item) => <li key={item}>{item}</li>)}</ul></div>
          <BuildEstimate />
        </div>
      </div></section>

      {picked.length > 0 && <section className="wrap section">
        <p className="eyebrow">{t("portfolio")}</p><h2>{t("portfolioTitle")}</h2><p className="intro">{t("portfolioIntro")}</p>
        <div className="portfolio">{picked.slice(0, 4).map((house) => (
          <Link key={house.code} href={housePath(house, locale)}>
            <Image src={house.cover.url} alt="" fill sizes="(min-width: 690px) 25vw, 50vw" /><strong>{house.name} →</strong>
          </Link>
        ))}</div>
      </section>}

      <section className="dark" id="jarayon"><div className="wrap section">
        <h2>{t("why")}</h2><div className="benefits">{steps.map((step, index) => (
          <article key={step.title}><b aria-hidden="true">{["⌂", "✎", "▤", "↗"][index]}</b><h3>{step.title}</h3><p>{step.text}</p></article>
        ))}</div>
      </div></section>

      <section className="wrap section" id="fikrlar">
        <p className="eyebrow">{t("review")}</p><h2>{t("reviewTitle")}</h2>
        <div className="review"><p>{t("reviewIntro")}</p><Link href={consult}>{t("contact")} →</Link></div>
      </section>

      <section className="band" id="aloqa"><div className="wrap section consult">
        <Image src="/brand/home-consult.jpg" alt="" width={1050} height={788} />
        <div><p className="eyebrow">{browse("consult")}</p><h2>{t("consultTitle")}</h2><p className="intro">{browse("consultIntro")}</p>
          <ul className="consult-list">{(t.raw("consultItems") as string[]).map((item) => <li key={item}>{item}</li>)}</ul>
          {contact ? <a className="button" href={contact}>Telegram ↗</a> : <Link className="button" href={consult}>{browse("consult")} →</Link>}
        </div>
      </div></section>

      <section className="wrap section" id="maqolalar">
        <p className="eyebrow">{browse("guides")}</p><h2>{t("guideTitle")}</h2><p className="intro">{browse("guidesIntro")}</p>
        <div className="cards">{guide.map((item, index) => {
          const house = picked[index];
          return <article className="card" key={item.title}>
            {house && <div className="photo-frame"><Image src={house.cover.url} alt="" fill sizes="(min-width: 690px) 33vw, 50vw" /></div>}
            <div className="card-body"><h3>{item.title}</h3><p>{item.text}</p></div>
          </article>;
        })}</div>
      </section>

      <section className="band" id="faq"><div className="wrap section faq">
        <p className="eyebrow">{browse("faq")}</p><h2>{t("faqTitle")}</h2>
        {faq.map((item, index) => <details key={item.title} open={index === 0}><summary>{item.title}</summary><p>{item.text}</p></details>)}
      </div></section>

      <section className="closing section"><div className="wrap">
        <h2>{t("closing")}</h2><p className="intro">{t("closingIntro")}</p>
        <Link className="button" href="/loyihalar">{home("viewCatalog")} →</Link>{" "}
        <Link className="button outline" href={consult}>{browse("consult")} →</Link>
      </div></section>
    </div>
  );
}
