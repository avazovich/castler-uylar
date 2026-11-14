import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatNumber } from "@/lib/format";
import type { HouseSummary } from "@/lib/houses";
import { houseAlt, housePath } from "@/lib/seo";
import { STYLES } from "@/lib/vocab";
import { ArrowRightIcon } from "./icons";

/** Catalog tile. Works in both server pages and the client-side Catalog. */
export function HouseCard({ house, priority = false }: { house: HouseSummary; priority?: boolean }) {
  const t = useTranslations("common");
  const th = useTranslations("house");
  const locale = useLocale() as Locale;
  const n = formatNumber;
  const title = house.name ?? t("projectNo", { code: house.code });

  const browse = useTranslations("browse");
  const specs = [
    `${n(house.totalArea)} m²`,
    house.bedrooms ? n(house.bedrooms) + " " + t("specBedrooms").toLowerCase() : null,
    t("floors", { count: house.floors, label: n(house.floors) }),
    `${n(house.plotSotix)} ${locale === "ru" ? "сот." : "sotix"}`,
  ].filter(Boolean);

  return (
    <Link
      href={housePath(house, locale)}
      className="lift group flex flex-col overflow-hidden rounded-xl border border-line bg-paper hover:border-ink/30 hover:shadow-[0_22px_44px_-24px_rgba(26,29,22,0.5)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
        <Image src={house.cover.url} alt={houseAlt(house, locale)} fill fetchPriority={priority ? "high" : "auto"} loading={priority ? "eager" : "lazy"}
          sizes="(min-width: 1280px) 392px, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, calc(100vw - 32px)"
          placeholder={house.cover.lqip ? "blur" : "empty"} blurDataURL={house.cover.lqip}
          style={{ objectPosition: house.cover.position }}
          className="object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.025]" />
        {(house.featured || house.isSample) && <span className="absolute left-3 top-3 rounded-sm bg-ink px-2 py-1 text-[10px] font-black tracking-wide text-white uppercase">
          {house.isSample ? t("sample") : browse("featuredPlan")}
        </span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {house.style && <p className="label-caps text-gold">{STYLES[house.style][locale]}</p>}
        <h3 className="mt-1 text-xl leading-tight font-black">{title}</h3>
        {house.name && <p className="mt-1 text-xs text-ink-soft">№ {house.code}</p>}
        <div className="mt-3 flex flex-wrap items-baseline justify-between gap-x-2 rounded border border-line bg-paper-2 px-3 py-2">
          <span className="label-caps text-ink-soft">{browse("planPrice")}</span>
          <div className="flex flex-wrap items-baseline gap-x-2">
            {house.oldPriceUzs && <span className="text-xs text-ink-soft line-through">{t("price", { amount: n(house.oldPriceUzs) })}</span>}
            <strong>{t("price", { amount: n(house.priceUzs) })}</strong>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-soft">{specs.join(" · ")}</p>
        <span className="mt-auto flex justify-end pt-4 text-sm font-bold text-gold group-hover:underline">{th("details")} <ArrowRightIcon className="ml-2 h-4 w-4" /></span>
      </div>
    </Link>
  );
}
