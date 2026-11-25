import "server-only";
import { getHouse } from "./houses";
import { sanityImageUrl } from "./imageUrl";

/**
 * Sanity makes each picture size the first time somebody asks for it (1–2 s)
 * and keeps it afterwards — per full address, so the readable file name counts
 * too. Asking for the sizes the site uses right after a house is saved means
 * the first real visitor never waits for that.
 * Keep the widths in step with `images` in next.config.ts (imageSizes + deviceSizes).
 */
const WIDTHS = [96, 200, 400, 800, 1200, 1600, 1920];

/** `urls`: photo addresses exactly as the site uses them (readable name, maybe ?rect=…). */
export async function warmPhotos(urls: string[]): Promise<void> {
  const jobs = urls
    .filter((u) => u.startsWith("https://cdn.sanity.io/"))
    .flatMap((u) => WIDTHS.map((w) => sanityImageUrl(u, w)));
  // A handful at a time — be kind to the image service.
  for (let i = 0; i < jobs.length; i += 6) {
    await Promise.allSettled(
      jobs.slice(i, i + 6).map((job) =>
        fetch(job, { headers: { Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8" }, cache: "no-store" }).then((r) => r.arrayBuffer()),
      ),
    );
  }
}

/** Every photo and floor plan of one house, at the addresses the site shows. */
export async function warmHouse(code: number): Promise<void> {
  const house = await getHouse(code, "uz");
  if (!house) return;
  await warmPhotos([house.cover, ...house.gallery, ...house.floorPlans.flatMap((f) => (f.plan ? [f.plan] : []))].map((img) => img.url));
}
