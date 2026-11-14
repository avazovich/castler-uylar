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
  const [t, nav, home] = await Promise.all([getTranslations("browse"), getTranslations("nav"), getTranslations("home")]);
  const categories = section === "styles" || section === "collections"
    ? liveCollections((await getHouses(locale)).map(toSummary)).filter(({ collection }) =>
        section === "styles" ? collection.group === "style" : collection.group !== "style")
    : [];
  const guide = section === "faq" ? t.raw("faqItems") : home.raw("guide");
  const settings = section === "consult" ? await getSettings(locale) : undefined;
  const sizes = [
    { label: t("compact"), query: "max=300" },
    { label: t("medium"), query: "min=301&max=400" },
    { label: t("large"), query: "min=401" },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: nav("home"), path: `/${locale}` }, { name: t(section), path: `/${locale}${browsePath(section)}` }])} />
      <PageHeader title={t(section)} crumbs={[{ label: nav("home"), href: "/" }, { label: t(section) }]} />
      <section className="mx-auto max-w-[1280px] px-4 py-12 md:px-8">
        <p className="mb-8 max-w-2xl text-lg text-ink-soft">{t(`${section}Intro`)}</p>
        {categories.length > 0 && <BrowseTiles categories={categories} locale={locale} />}
        {(section === "styles" || section === "collections") && categories.length === 0 &&
          <Link href="/loyihalar" className="btn bg-ink text-paper">{nav("catalog")}</Link>}
        {section === "size" && (
          <div className="grid gap-4 sm:grid-cols-3">
            {sizes.map(({ label, query }) => <Link key={query} className="rounded-lg border border-line bg-paper-2 p-6 text-lg font-semibold hover:border-gold" href={`/loyihalar?${query}`}>{label} →</Link>)}
          </div>
        )}
        {section === "cost" && <BuildEstimate />}
        {(section === "guides" || section === "faq") && (
          <div className="max-w-3xl space-y-3">
            {(guide as { title: string; text: string }[]).map((item) => (
              <details key={item.title} className="rounded-lg border border-line bg-paper p-4">
                <summary className="cursor-pointer font-semibold">{item.title}</summary>
                <p className="mt-3 text-ink-soft">{item.text}</p>
              </details>
            ))}
          </div>
        )}
        {settings && <div className="max-w-xl rounded-xl border border-line p-5"><LeadForm phone={settings.phone} /></div>}
      </section>
    </>
  );
}
