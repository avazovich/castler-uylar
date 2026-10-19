import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatNumber } from "@/lib/format";
import type { HouseSummary } from "@/lib/houses";
import { STYLES } from "@/lib/vocab";
import { ArrowRightIcon } from "./icons";

/** Catalog tile. Works in both server pages and the client-side Catalog. */
export function HouseCard({ house, priority = false }: { house: HouseSummary; priority?: boolean }) {
  const t = useTranslations("common");
  const th = useTranslations("house");
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
    <Link
      href={`/loyihalar/${house.code}`}
      className="group flex flex-col border border-line bg-paper transition-[border-color,box-shadow] duration-300 hover:border-ink/30 hover:shadow-[0_18px_40px_-24px_rgba(26,29,22,0.45)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
        <Image
          src={house.cover.url}
          alt={title}
          fill
          priority={priority}
          sizes="(min-width: 1280px) 420px, (min-width: 640px) 50vw, 100vw"
          placeholder={house.cover.lqip ? "blur" : "empty"}
          blurDataURL={house.cover.lqip}
          style={{ objectPosition: house.cover.position }}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <span className="label-caps absolute left-0 top-0 bg-ink px-3 py-2 text-paper">№ {house.code}</span>
        {house.isSample && (
          <span className="label-caps absolute right-0 top-0 bg-gold px-3 py-2 text-paper">{t("sample")}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="font-display truncate text-[28px] leading-tight text-ink">{title}</h3>
        <p className="mt-1 text-sm text-ink-soft">
          {[house.style ? STYLES[house.style][locale] : null, t("floors", { count: house.floors, label: n(house.floors) })]
            .filter(Boolean)
            .join(" · ")}
        </p>

        <dl className="mt-5 grid grid-cols-4 border-y border-line">
          {specs.map((s, i) => (
            <div key={s.label} className={`min-w-0 py-3 ${i > 0 ? "border-l border-line pl-3" : ""}`}>
              <dt className="truncate text-[11px] text-ink-soft">{s.label}</dt>
              <dd className="mt-0.5 text-[16px] font-semibold text-ink">{s.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-auto flex items-end justify-between gap-4 pt-5">
          <div>
            <p className="whitespace-nowrap text-lg font-semibold text-ink">{t("price", { amount: n(house.priceUzs) })}</p>
            {house.oldPriceUzs && (
              <p className="whitespace-nowrap text-sm text-ink-soft line-through">
                {t("price", { amount: n(house.oldPriceUzs) })}
              </p>
            )}
          </div>
          <span className="label-caps inline-flex items-center gap-2 pb-1 text-ink transition-colors group-hover:text-gold">
            {th("details")} <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
