/**
 * Photo addresses on Sanity's CDN. Every photo gets ONE public address — the
 * same one in the page's <img src>, the sitemap and the structured data — so
 * search engines see one picture, not four copies with different sizes. It
 * also carries a readable file name ("…/113-basseynli-…-uy-loyihasi-1.jpg"),
 * which Sanity serves exactly like the bare asset.
 */

/** The width the page's <img src> uses (the largest in next.config's deviceSizes). */
export const CANONICAL_WIDTH = 1920;

/** A resized copy from Sanity: ?w=…&fit=max&auto=format (q only when it isn't Sanity's default 75). */
export function sanityImageUrl(src: string, width: number, quality?: number): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  if (quality && quality !== 75) url.searchParams.set("q", String(quality));
  else url.searchParams.delete("q");
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");
  return url.toString();
}

/** The one address of a photo, as in the page's <img src>. */
export const canonicalImageUrl = (src: string) =>
  src.startsWith("https://cdn.sanity.io/") ? sanityImageUrl(src, CANONICAL_WIDTH) : src;

/** "…/abc-1920x1080.jpg" → "…/abc-1920x1080.jpg/<name>.jpg" (query kept). Leaves other hosts alone. */
export function withFileName(src: string, name: string): string {
  if (!src.startsWith("https://cdn.sanity.io/images/") || !name) return src;
  const url = new URL(src);
  const ext = url.pathname.match(/\.(jpe?g|png|webp)$/i)?.[1]?.toLowerCase();
  if (!ext) return src;
  url.pathname = `${url.pathname}/${name}.${ext === "jpeg" ? "jpg" : ext}`;
  return url.toString();
}
