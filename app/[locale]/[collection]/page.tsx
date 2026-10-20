import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { HouseCard } from "@/components/HouseCard";
import { ArrowRightIcon } from "@/components/icons";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { collectionHref, findCollection, liveCollections } from "@/lib/collections";
import { formatNumber } from "@/lib/format";
import { getHouses, toSummary } from "@/lib/houses";
import { alternates, breadcrumbLd, itemListLd, socialImage } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
  const houses = (await getHouses(routing.defaultLocale)).map(toSummary);
  const live = liveCollections(houses);
  return routing.locales.flatMap((locale) => live.map(({ collection }) => ({ locale, collection: collection.slug[locale] })));
}

async function load(locale: Locale, slug: string) {
  const collection = findCollection(slug);
  if (!collection) return null;
  const houses = (await getHouses(locale)).map(toSummary);
  return { collection, houses: houses.filter(collection.match), all: houses };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; collection: string }>;
}): Promise<Metadata> {
  const { locale: raw, collection: slug } = await params;
  const locale = raw as Locale;
  const data = await load(locale, decodeURIComponent(slug));
  if (!data || data.houses.length === 0) return {};
  const meta = await getTranslations({ locale, namespace: "meta" });
  const c = data.collection;
  const title = meta("collectionTitle", { title: c.title[locale] });
  const from = formatNumber(Math.min(...data.houses.map((h) => h.priceUzs)));
  const description = meta("collectionDescription", { title: c.title[locale], count: data.houses.length, from });
  return {
    title,
    description,
    alternates: alternates(locale, (l) => `/${l}/${c.slug[l]}`),
    openGraph: {
      title,
      description,
      url: `/${locale}/${c.slug[locale]}`,
      images: [{ url: socialImage(data.houses[0].cover), width: 1200, height: 630 }],
    },
  };
}

export default async function CollectionPage({ params }: { params: Promise<{ locale: string; collection: string }> }) {
  const { locale: raw, collection: rawSlug } = await params;
  const locale = raw as Locale;
  setRequestLocale(locale);
  const slug = decodeURIComponent(rawSlug);

  const data = await load(locale, slug);
  // Unknown words, or a category with no houses right now → normal 404.
  if (!data || data.houses.length === 0) notFound();
  const { collection: c, houses, all } = data;
  // Arrived with the other language's slug (e.g. after switching language).
  if (slug !== c.slug[locale]) permanentRedirect(`/${locale}/${c.slug[locale]}`);

  const [t, nav, catalog, home] = await Promise.all([
    getTranslations("collection"),
    getTranslations("nav"),
    getTranslations("catalog"),
    getTranslations("home"),
  ]);
  const others = liveCollections(all).filter((x) => x.collection.id !== c.id);
  const path = `/${locale}/${c.slug[locale]}`;

  return (
    <>
      <JsonLd
        data={[
          breadcrumbLd([
            { name: nav("home"), path: `/${locale}` },
            { name: catalog("eyebrow"), path: `/${locale}/loyihalar` },
            { name: c.title[locale], path },
          ]),
          { ...itemListLd(locale, houses), name: c.title[locale] },
        ]}
      />
      <PageHeader
        crumbs={[{ label: nav("home"), href: "/" }, { label: catalog("eyebrow"), href: "/loyihalar" }, { label: c.title[locale] }]}
        title={c.title[locale]}
        subtitle={t("count", { count: houses.length })}
      />

      <div className="mx-auto max-w-[1280px] px-4 pb-24 pt-10 md:px-8 md:pt-12">
        <div className="max-w-3xl space-y-4 text-lg leading-relaxed text-ink">
          {c.intro[locale].map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {houses.map((h, i) => (
            <HouseCard key={h.code} house={h} priority={i < 3} />
          ))}
        </div>

        <div className="mt-10">
          <Link href="/loyihalar" className="btn border border-ink text-ink hover:bg-ink hover:text-paper">
            {t("allProjects")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        {others.length > 0 && (
          <nav aria-label={t("otherTitle")} className="mt-16 border-t border-line pt-10">
            <h2 className="font-display text-[34px] leading-tight text-ink">{t("otherTitle")}</h2>
            <ul className="mt-6 flex flex-wrap gap-2">
              {others.map(({ collection: o, houses: list }) => (
                <li key={o.id}>
                  <Link href={collectionHref(o, locale)} className="block border border-line px-4 py-2.5 text-ink hover:border-ink">
                    {o.title[locale]} <span className="text-ink-soft">· {list.length}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-16 border border-line bg-paper-2 p-6 md:p-10">
          <p className="font-display text-[30px] leading-tight text-ink">{home("customTitle")}</p>
          <p className="mt-3 max-w-2xl text-ink-soft">{home("customText")}</p>
          <Link href="/#aloqa" className="btn mt-6 bg-ink text-paper hover:bg-gold">
            {home("customEyebrow")} <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
