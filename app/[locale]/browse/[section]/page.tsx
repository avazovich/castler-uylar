import Image from "next/image";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { BuildEstimate } from "@/components/BuildEstimate";
import { BrowseTiles } from "@/components/BrowseTiles";
import { JsonLd } from "@/components/JsonLd";
import { LeadForm } from "@/components/LeadForm";
import { PageHeader } from "@/components/PageHeader";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { browsePath, browseSections } from "@/lib/browse";
import { liveCollections } from "@/lib/collections";
import { getHouses, getSettings, toSummary } from "@/lib/houses";
import { breadcrumbLd, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; section: string }> };

async function readParams(params: Props["params"]) {
  const { locale, section } = await params;
  const entry = browseSections.find((item) => item === section);
  if (!hasLocale(routing.locales, locale) || !entry) notFound();
  return { locale, section: entry };
}

export function generateStaticParams() {
  return browseSections.map((section) => ({ section }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, section } = await readParams(params);
  const t = await getTranslations({ locale, namespace: "browse" });
  return pageMetadata(locale, (language) => `/${language}${browsePath(section)}`, `${t(section)} | Castler Uylar`, t(`${section}Intro`));
}

export default async function BrowsePage({ params }: Props) {
  const { locale, section } = await readParams(params);
  setRequestLocale(locale);
  const [t, nav, home, blog] = await Promise.all([getTranslations("browse"), getTranslations("nav"), getTranslations("home"), getTranslations("blog")]);
  const houses = await getHouses(locale);
  const categories = section === "styles" || section === "collections"
    ? liveCollections(houses.map(toSummary)).filter(({ collection }) =>
        section === "styles" ? collection.group === "style" : collection.group !== "style")
    : [];
  const guide = section === "faq" ? t.raw("faqItems") : home.raw("guide");
  const settings = section === "consult" ? await getSettings(locale) : undefined;
  const sizes = [
    { label: t("compact"), query: "max=300", min: 0, max: 300 },
    { label: t("medium"), query: "min=301&max=400", min: 301, max: 400 },
    { label: t("large"), query: "min=401", min: 401, max: Infinity },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: nav("home"), path: `/${locale}` }, { name: t(section), path: `/${locale}${browsePath(section)}` }])} />
      <PageHeader title={t(section)} subtitle={t(`${section}Intro`)} crumbs={[{ label: nav("home"), href: "/" }, { label: t(section) }]} />
      <section className="mx-auto max-w-[1280px] px-4 py-12 md:px-8">
        {categories.length > 0 && <BrowseTiles categories={categories} locale={locale} />}
        {(section === "styles" || section === "collections") && categories.length === 0 &&
          <Link href="/loyihalar" className="btn bg-ink text-paper">{nav("catalog")}</Link>}
        {section === "size" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {sizes.map(({ label, query, min, max }) => {
              const matching = houses.filter((house) => house.totalArea >= min && house.totalArea <= max);
              const cover = matching[0]?.cover;
              return (
                <Link key={query} className="group relative isolate flex min-h-52 items-end overflow-hidden rounded-xl bg-ink p-5 text-white md:min-h-72" href={`/loyihalar?${query}`}>
                  {cover && <Image src={cover.url} alt="" fill sizes="(min-width: 640px) 33vw, 100vw" className="-z-20 object-cover" style={{ objectPosition: cover.position }} />}
                  <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 to-black/15" />
                  <h2 className="font-display text-2xl md:text-3xl">{label} →</h2>
                </Link>
              );
            })}
          </div>
        )}
        {section === "cost" && <BuildEstimate />}
        {(section === "guides" || section === "faq") && (
          <div className={section === "guides" ? "grid gap-4 md:grid-cols-3" : "max-w-3xl space-y-3"}>
            {(guide as { title: string; text: string }[]).map((item, index) => (
              <details key={item.title} className="overflow-hidden rounded-xl border border-line bg-paper p-4">
                {section === "guides" && houses[index] && <div className="relative mb-4 aspect-video rounded-lg bg-paper-2">
                  <Image src={houses[index].cover.url} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="rounded-lg object-contain" />
                </div>}
                <summary className="cursor-pointer font-semibold">{item.title}</summary>
                <p className="mt-3 text-ink-soft">{item.text}</p>
              </details>
            ))}
          </div>
        )}
        {section === "guides" && <Link href="/blog" className="btn mt-6 bg-gold text-white">{blog("all")} →</Link>}
        {settings && <div className="grid gap-5 md:grid-cols-2">
          <div className="relative min-h-52 overflow-hidden rounded-xl bg-paper-2">
            <Image src="/brand/home-consult.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="rounded-xl border border-line bg-paper p-5 md:p-7"><LeadForm phone={settings.phone} /></div>
        </div>}
      </section>
    </>
  );
}
