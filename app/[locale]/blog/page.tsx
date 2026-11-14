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

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "blog" });
  return pageMetadata(locale, articlePath, t("metaTitle"), t("intro"));
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const [t, nav] = await Promise.all([getTranslations("blog"), getTranslations("nav")]);
  return (
    <>
      <JsonLd data={[
        breadcrumbLd([{ name: nav("home"), path: `/${locale}` }, { name: t("label"), path: articlePath(locale) }]),
        { "@context": "https://schema.org", "@type": "CollectionPage", name: t("title"), url: absoluteUrl(articlePath(locale)), inLanguage: locale },
      ]} />
      <PageHeader title={t("title")} subtitle={t("intro")} crumbs={[{ label: nav("home"), href: "/" }, { label: t("label") }]} />
      <div className="bg-paper-2">
        <ul className="mx-auto grid max-w-[1280px] gap-4 px-4 py-8 sm:grid-cols-2 md:px-8 md:py-12 lg:grid-cols-3">
          {articles.map(({ slug, [locale]: article }) => (
            <li key={slug}>
              <Link className="group flex h-full flex-col rounded-xl border border-line bg-white p-5 transition-colors hover:border-gold md:p-6" href={blogPath(slug)}>
                <h2 className="font-display text-2xl leading-tight">{article.title}</h2>
                <p className="mb-5 mt-2 text-ink-soft">{article.description}</p>
                <span className="mt-auto text-sm font-bold text-gold group-hover:underline">{t("read")} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
