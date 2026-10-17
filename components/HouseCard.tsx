import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatNumber } from "@/lib/format";
import type { HouseSummary } from "@/lib/houses";
import { STYLES } from "@/lib/vocab";

/** Catalog tile. Works in both server pages and the client-side Catalog. */
export function HouseCard({ house, priority = false }: { house: HouseSummary; priority?: boolean }) {
  const t = useTranslations("common");
  const locale = useLocale() as Locale;
  const n = formatNumber;
  const title = house.name ?? t("projectNo", { code: house.code });

  const specs = [
    { label: t("specPlot"), value: n(house.plotSotix) },
    { label: t("specArea"), value: n(house.totalArea) },
    { label: t("specFloors"), value: n(house.floors) },
    { label: t("specBedrooms"), value: house.bedrooms ? n(house.bedrooms) : "—" },
  ];

  return (
    <Link href={`/loyihalar/${house.code}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-paper-2">
        <Image
          src={house.cover.url}
          alt={title}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 420px, (min-width: 640px) 50vw, 100vw"
          placeholder={house.cover.lqip ? "blur" : "empty"}
          blurDataURL={house.cover.lqip}
          style={{ objectPosition: house.cover.position }}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        <span className="label-mono absolute left-3 top-3 rounded-full bg-paper/90 px-3 py-1.5 text-ink backdrop-blur">
          № {house.code}
        </span>
        {house.isSample && (
          <span className="label-mono absolute right-3 top-3 rounded-full bg-gold px-3 py-1.5 text-paper">
            {t("sample")}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-display truncate text-[22px] leading-tight text-ink">{title}</h3>
          <p className="mt-1 text-sm text-ink-soft">
            {[house.style ? STYLES[house.style][locale] : null, t("floors", { count: house.floors, label: n(house.floors) })]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="whitespace-nowrap font-medium text-ink">{t("price", { amount: n(house.priceUzs) })}</p>
          {house.oldPriceUzs && (
            <p className="whitespace-nowrap text-sm text-ink-soft line-through">
              {t("price", { amount: n(house.oldPriceUzs) })}
            </p>
          )}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-line pt-3">
        {specs.map((s) => (
          <div key={s.label} className="min-w-0">
            <dt className="truncate text-[11px] text-ink-soft">{s.label}</dt>
            <dd className="mt-0.5 text-[15px] font-medium text-ink">{s.value}</dd>
          </div>
        ))}
      </dl>
    </Link>
  );
}
