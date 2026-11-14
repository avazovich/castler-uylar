import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { PageHeader } from "@/components/PageHeader";
import { articles, articlePath, blogPath } from "@/content/blog";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { absoluteUrl, breadcrumbLd, pageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };

async function readArticle(params: Props["params"]) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const article = articles.find((entry) => entry.slug === slug);
  if (!article) notFound();
  return { locale, entry: article, article: article[locale] };
}

export function generateStaticParams() {
  return articles.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, entry, article } = await readArticle(params);
  const metadata = pageMetadata(locale, (language) => articlePath(language, entry.slug), `${article.title} | Castler Uylar`, article.description);
  return { ...metadata, openGraph: { ...metadata.openGraph, type: "article" } };
}

export default async function BlogArticlePage({ params }: Props) {
  const { locale, entry, article } = await readArticle(params);
  setRequestLocale(locale);
  const [t, nav, browse] = await Promise.all([getTranslations("blog"), getTranslations("nav"), getTranslations("browse")]);
  const path = articlePath(locale, entry.slug);
  const destinationLabel = entry.destination === "/browse/consult" ? browse("consult")
    : entry.destination === "/browse/cost" ? browse("cost") : nav("catalog");
  return (
    <>
      <JsonLd data={[
        breadcrumbLd([{ name: nav("home"), path: `/${locale}` }, { name: t("label"), path: articlePath(locale) }, { name: article.title, path }]),
        { "@context": "https://schema.org", "@type": "BlogPosting", headline: article.title, description: article.description,
          inLanguage: locale, mainEntityOfPage: absoluteUrl(path), image: absoluteUrl("/brand/social.jpg"),
          author: { "@type": "Organization", name: "Castler Uylar", url: absoluteUrl(`/${locale}`) } },
      ]} />
      <article>
        <PageHeader title={article.title} subtitle={article.description}
          crumbs={[{ label: nav("home"), href: "/" }, { label: t("label"), href: blogPath() }, { label: article.title }]} />
        <div className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:space-y-10 md:px-8 md:py-12">
          {article.sections.map(([heading, paragraph]) => (
            <section key={heading}>
              <h2 className="font-display text-[clamp(1.45rem,4vw,2rem)] leading-tight">{heading}</h2>
              <p className="mt-3 text-base leading-relaxed text-ink-soft md:text-lg">{paragraph}</p>
            </section>
          ))}
          <div className="flex flex-wrap items-center gap-4 border-t border-line pt-6">
            <Link className="btn bg-gold text-white hover:bg-ink" href={entry.destination}>{destinationLabel} →</Link>
            <Link className="font-bold text-gold hover:underline" href={blogPath()}>{t("all")} →</Link>
          </div>
        </div>
      </article>
    </>
  );
}
