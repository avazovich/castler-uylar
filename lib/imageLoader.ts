"use client";

/** next/image loader: Sanity CDN photos are resized by Sanity itself
 *  (?w=…&auto=format), local files in /public are served as-is. */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://cdn.sanity.io/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 75));
    url.searchParams.set("fit", "max");
    url.searchParams.set("auto", "format");
    return url.toString();
  }
  return `${src}?w=${width}`;
}
