import Image from "next/image";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { collectionHref, type liveCollections } from "@/lib/collections";

export function BrowseTiles({ categories, locale }: {
  categories: ReturnType<typeof liveCollections>;
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
      {categories.map(({ collection, houses }) => {
        const cover = houses[0].cover;
        return (
          <Link key={collection.id} href={collectionHref(collection, locale)} className="group overflow-hidden rounded-lg border border-line bg-paper transition-colors hover:border-gold">
            <div className="relative aspect-[5/4] bg-paper-2">
              <Image src={cover.url} alt="" fill sizes="(min-width: 1024px) 200px, (min-width: 768px) 33vw, 50vw" className="object-contain" />
            </div>
            <div className="flex items-start justify-between gap-2 p-3 text-sm font-bold">
              {collection.short[locale]} <span aria-hidden="true">↗</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
