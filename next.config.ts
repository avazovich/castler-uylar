import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    // Photos live on Sanity's CDN, which resizes on its own — see
    // lib/imageLoader.ts. Keeps Vercel's image-optimization quota out of it.
    loader: "custom",
    loaderFile: "./lib/imageLoader.ts",
  },
};

export default withNextIntl(nextConfig);
