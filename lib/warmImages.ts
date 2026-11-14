import "server-only";

/**
 * Sanity makes each picture size the first time somebody asks for it (1–2 s)
 * and keeps it afterwards. Asking for the few sizes the site uses right after
 * a house is saved means the first real visitor never waits for that.
 * Keep the widths in step with `images` in next.config.ts and lib/imageLoader.ts.
 */
const WIDTHS = [96, 200, 400, 800, 1200, 1600];

export async function warmPhotos(urls: string[]): Promise<void> {
  const jobs = urls
    .filter((u) => u.startsWith("https://cdn.sanity.io/"))
    .flatMap((u) => WIDTHS.map((w) => `${u}?w=${w}&q=75&fit=max&auto=format`));
  // A handful at a time — be kind to the image service.
  for (let i = 0; i < jobs.length; i += 6) {
    await Promise.allSettled(
      jobs.slice(i, i + 6).map((job) =>
        fetch(job, { headers: { Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" }, cache: "no-store" }).then((r) => r.arrayBuffer()),
      ),
    );
  }
}
