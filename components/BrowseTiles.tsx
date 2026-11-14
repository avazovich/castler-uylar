import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { collectionHref, type liveCollections } from "@/lib/collections";

export async function BrowseTiles({ categories, locale }: {
  categories: ReturnType<typeof liveCollections>;
  locale: Locale;
}) {
  const t = await getTranslations("collection");
  return (
    <div className="stagger grid grid-cols-2 gap-4 lg:grid-cols-3">
      {categories.map(({ collection, houses }) => {
        const cover = houses[0].cover;
        return (
          <Link key={collection.id} href={collectionHref(collection, locale)} className="group relative isolate flex aspect-[4/3] items-end overflow-hidden rounded-xl bg-ink text-white">
            <div className="absolute inset-0 -z-20">
              <Image src={cover.url} alt="" fill sizes="(min-width: 1024px) 33vw, 50vw" placeholder={cover.lqip ? "blur" : "empty"} blurDataURL={cover.lqip} style={{objectPosition: cover.position}} className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03]" />
            </div>
            <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/85 via-black/20 to-transparent" />
            <div className="flex w-full items-end justify-between gap-2 p-4">
              <div><h2 className="font-display text-xl md:text-3xl">{collection.short[locale]}</h2>
                <p className="text-sm text-white/85">{t("count", { count: houses.length })}</p></div>
              <span aria-hidden="true">↗</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
