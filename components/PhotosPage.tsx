import type { Metadata } from "next";
import Image from "next/image";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, permanentRedirect } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { PHOTOS_TEXT, photosDescription, photosIntro, photosPath, photosTitle } from "@/content/photos";
import { formatNumber } from "@/lib/format";
import { getHouses, type House } from "@/lib/houses";
import { canonicalImageUrl } from "@/lib/imageUrl";
import { absoluteUrl, breadcrumbLd, houseAlt, houseKind, housePath, imageObjectLd, pageMetadata, planAlt } from "@/lib/seo";
import { STYLES } from "@/lib/vocab";
import { JsonLd } from "./JsonLd";
import { PageHeader } from "./PageHeader";

/**
 * «Uy loyihalari rasmlari va chizmalari» / «Проекты домов: фото и чертежи»:
 * every photo and floor plan of the catalog on one page, each captioned with
 * what it shows and linked to its house — for the people who search Google
 * (and Google Images) for house pictures and drawings rather than for a shop.
 * Lives at /uz/uy-loyihalari-rasmlari and /ru/proekty-domov-foto-i-chertezhi.
 */

const real = (houses: House[]) => houses.filter((h) => !h.isSample);
const plansOf = (h: House) => h.floorPlans.flatMap((f) => (f.plan ? [{ ...f, plan: f.plan }] : []));

/** "1 va 2 qavatli; zamonaviy, neoklassik va klassik" / "одноэтажные и двухэтажные; современный стиль, неоклассика…" */
function kindsLine(houses: House[], locale: Locale): string {
  const and = locale === "ru" ? " и " : " va ";
  const join = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")}${and}${xs.at(-1)}`);
  const floors = [...new Set(houses.map((h) => h.floors))].sort((a, b) => a - b);
  const styles = (["modern", "neoclassic", "classic"] as const).filter((s) => houses.some((h) => h.style === s));
  if (locale === "ru") {
    const ruFloors: Record<string, string> = { "1": "одноэтажные", "1.5": "с мансардой", "2": "двухэтажные", "3": "трёхэтажные" };
    const f = join(floors.map((n) => ruFloors[String(n)] ?? `${formatNumber(n)}-этажные`));
    return [f && `${f} дома`, styles.length ? `стиль: ${join(styles.map((s) => STYLES[s].ru.toLowerCase()))}` : ""].filter(Boolean).join("; ");
  }
  const f = join(floors.map((n) => (n === 1.5 ? "mansardali" : formatNumber(n))));
  return [f && `${f} qavatli uylar`, join(styles.map((s) => STYLES[s].uz.toLowerCase()))].filter(Boolean).join("; ");
}

export async function photosMetadata(locale: Locale): Promise<Metadata> {
  const houses = real(await getHouses(locale));
  const photos = houses.reduce((n, h) => n + 1 + h.gallery.length, 0);
  const first = houses[0];
  return pageMetadata(
    locale,
    (l) => `/${l}${photosPath(l)}`,
    photosTitle(locale, houses.length),
    photosDescription(locale, houses.length, photos, kindsLine(houses, locale)),
    first?.cover,
    first ? houseAlt(first, locale, 1, first.cover.caption) : undefined,
  );
}

export async function PhotosPage({ locale: raw, slugLocale }: { locale: string; slugLocale: Locale }) {
  if (!hasLocale(routing.locales, raw)) notFound();
  const locale: Locale = raw;
  // /ru/<Uzbek slug> or /uz/<Russian slug> (the language switch keeps the path) → the right one.
  if (locale !== slugLocale) permanentRedirect(`/${locale}${photosPath(locale)}`);
  setRequestLocale(locale);

  const [nav, houses] = await Promise.all([getTranslations("nav"), getHouses(locale).then(real)]);
  const photoCount = houses.reduce((n, h) => n + 1 + h.gallery.length, 0);
  const planCount = houses.reduce((n, h) => n + plansOf(h).length, 0);
  const text = (k: keyof typeof PHOTOS_TEXT) => PHOTOS_TEXT[k][locale];
  const path = `/${locale}${photosPath(locale)}`;

  const gallery = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: text("h1"),
    url: absoluteUrl(path),
    inLanguage: locale,
    // The cover of every house; the other photos are on the page and in the sitemap.
    associatedMedia: houses.map((h) => imageObjectLd(canonicalImageUrl(h.cover.url), houseAlt(h, locale, 1, h.cover.caption))),
  };

  return (
    <>
      <JsonLd data={[breadcrumbLd([{ name: nav("home"), path: `/${locale}` }, { name: text("h1"), path }]), gallery]} />
      <PageHeader title={text("h1")} subtitle={text("subtitle")} crumbs={[{ label: nav("home"), href: "/" }, { label: text("h1") }]} />

      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-8 md:py-14">
        <p className="max-w-3xl text-lg text-ink-soft">{photosIntro(locale, houses.length, photoCount, planCount)}</p>

        <div className="mt-10 grid gap-14 md:gap-20">
          {houses.map((h) => {
            const href = housePath(h, locale);
            const photos = [h.cover, ...h.gallery];
            const name = h.name ?? `№ ${h.code}`;
            const facts = [
              houseKind(h.floors, locale),
              // Same wording as the house page's «Umumiy maydon» / «Общая площадь».
              locale === "ru" ? `общая площадь ${formatNumber(h.totalArea)} м²` : `umumiy maydon ${formatNumber(h.totalArea)} m²`,
              locale === "ru" ? `${formatNumber(h.plotSotix)} сот.` : `${formatNumber(h.plotSotix)} sotix`,
              h.style ? STYLES[h.style][locale] : "",
            ].filter(Boolean);
            return (
              <section key={h.code} aria-labelledby={`h-${h.code}`}>
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-line pb-3">
                  <div>
                    <h2 id={`h-${h.code}`} className="font-display text-[clamp(1.6rem,3.5vw,2.2rem)] leading-tight text-ink">
                      <Link href={href} className="hover:text-gold">{name}</Link>
                    </h2>
                    <p className="mt-1 text-[15px] text-ink-soft">{facts.join(" · ")}</p>
                  </div>
                  <Link href={href} className="text-sm font-bold text-gold hover:underline">{text("open")} →</Link>
                </div>

                <ul className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {photos.map((img, i) => (
                    <li key={img.url}>
                      <figure>
                        <Link href={href} className="relative block aspect-[4/3] overflow-hidden rounded-lg bg-paper-2">
                          <Image
                            src={img.url}
                            alt={houseAlt(h, locale, i + 1, img.caption)}
                            fill
                            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                            placeholder={img.lqip ? "blur" : "empty"}
                            blurDataURL={img.lqip}
                            className="object-cover transition-transform duration-500 hover:scale-[1.03]"
                            style={{ objectPosition: img.position }}
                          />
                        </Link>
                        {img.caption && <figcaption className="mt-1.5 text-[13px] leading-snug text-ink-soft">{img.caption}</figcaption>}
                      </figure>
                    </li>
                  ))}
                </ul>

                {plansOf(h).length > 0 && (
                  <>
                    <h3 className="mt-7 text-[13px] font-bold uppercase tracking-wider text-ink-soft">{text("plans")}</h3>
                    <ul className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                      {plansOf(h).map((f) => (
                        <li key={f.plan.url}>
                          <figure>
                            <Link href={href} className="relative block aspect-[4/3] overflow-hidden rounded-lg border border-line bg-paper">
                              <Image
                                src={f.plan.url}
                                alt={planAlt(h, locale, f.label)}
                                fill
                                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                                className="object-contain p-2"
                              />
                            </Link>
                            <figcaption className="mt-1.5 text-[13px] leading-snug text-ink-soft">
                              {f.label}{f.total > 0 ? ` · ${formatNumber(f.total)} m²` : ""}
                            </figcaption>
                          </figure>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
