"use client";

import { sanityImageUrl } from "./imageUrl";

/** next/image loader: Sanity CDN photos are resized by Sanity itself
 *  (?w=…&fit=max&auto=format — see lib/imageUrl.ts), local files in /public are served as-is. */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://cdn.sanity.io/")) return sanityImageUrl(src, width, quality);
  return `${src}?w=${width}`;
}
