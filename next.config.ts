import { articles, articlePath } from "./content/blog";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async redirects() {
    return articles.flatMap(({ legacySlug, slugs }) =>
      (["uz", "ru"] as const).flatMap((locale) => {
        const other = locale === "uz" ? "ru" : "uz";
        return [legacySlug, slugs[other]].map((slug) => ({
          source: articlePath(locale, slug),
          destination: articlePath(locale, slugs[locale]),
          permanent: true,
        }));
      }),
    );
  },
  images: {
    // Photos live on Sanity's CDN, which resizes on its own — see
    // lib/imageLoader.ts. Keeps Vercel's image-optimization quota out of it.
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
  },
};

export default withNextIntl(nextConfig);
