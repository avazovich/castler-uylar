import { articles, articlePath } from "./content/blog";
import { CALC_SLUG } from "./lib/browse";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    const blog = articles.flatMap(({ legacySlug, slugs }) =>
      (["uz", "ru"] as const).flatMap((locale) => {
        const other = locale === "uz" ? "ru" : "uz";
        return [legacySlug, slugs[other]].map((slug) => ({
          source: articlePath(locale, slug),
          destination: articlePath(locale, slugs[locale]),
          permanent: true,
        }));
      }),
    );
    // The calculator: its old address and the other language's slug (the
    // language switch keeps the path) go to this language's own address.
    // Next keeps the query, so a shared calculation (?area=…) survives.
    const calculator = (["uz", "ru"] as const).flatMap((locale) => {
      const other = locale === "uz" ? "ru" : "uz";
      return [`/${locale}/browse/cost`, `/${locale}/${CALC_SLUG[other]}`].map((source) => ({
        source,
        destination: `/${locale}/${CALC_SLUG[locale]}`,
        permanent: true,
      }));
    });
    return [...blog, ...calculator];
  },
  images: {
    // Photos live on Sanity's CDN, which resizes on its own — see
    // lib/imageLoader.ts. Keeps Vercel's image-optimization quota out of it.
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
    // Few, fixed picture widths on purpose. Sanity makes each size the first
    // time anybody asks for it (1–2 s) and then keeps it; with Next's default
    // ten widths almost every visitor hit a size nobody had asked for yet.
    // Four sizes means almost every picture is already waiting, ready-made.
    deviceSizes: [800, 1200, 1600, 1920],
    imageSizes: [96, 200, 400],
  },
};

export default withNextIntl(nextConfig);
