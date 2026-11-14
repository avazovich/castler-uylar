"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";
import { formatNumber } from "@/lib/format";
import type { Floor } from "@/lib/houses";

export function FloorPlans({ floors }: { floors: Floor[] }) {
  const t = useTranslations("house");
  const id = useId();
  const [selected, setSelected] = useState(() => Math.max(0, floors.findIndex((floor) => floor.level === "ground")));
  const floor = floors[selected];
  if (!floor) return null;

  return (
    <div className="mt-5">
      {floors.length > 1 && (
        <fieldset className="mb-4 flex flex-wrap gap-1.5">
          <legend className="sr-only">{t("plansTitle")}</legend>
          {floors.map(({ label }, index) => (
            <label key={index} className="cursor-pointer">
              <input type="radio" className="peer sr-only" name={id} checked={selected === index}
                onChange={() => setSelected(index)} />
              <span className="flex min-h-11 items-center rounded-full border border-line bg-paper-2 px-4 text-sm font-bold peer-checked:border-gold peer-checked:bg-gold peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold">
                {label}
              </span>
            </label>
          ))}
        </fieldset>
      )}

      <article key={selected} className="overflow-hidden rounded-lg border border-line">
        <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line bg-paper-2 px-4 py-3">
          <h3 className="font-display text-xl">{floor.label}</h3>
          {floor.total > 0 && <p className="text-sm font-semibold tabular-nums">{t("m2", { value: formatNumber(floor.total) })}</p>}
        </header>
        {floor.plan && (
          <a href={floor.plan.url} target="_blank" rel="noopener" className="relative block h-[clamp(190px,40vw,420px)] cursor-zoom-in bg-paper">
            <Image src={floor.plan.url} alt={t("planAlt", { level: floor.label })} fill
              sizes="(min-width: 1000px) 650px, calc(100vw - 72px)" className="object-contain p-3" />
          </a>
        )}
        {floor.rooms.length > 0 && (
          <details className="group border-t border-line">
            <summary className="flex min-h-11 cursor-pointer list-none flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm font-bold hover:bg-paper-2 [&::-webkit-details-marker]:hidden">
              <span>{t("roomList")} <span className="ml-1 font-normal tabular-nums text-ink-soft">({floor.rooms.length})</span></span>
              <span className="group-open:hidden" aria-hidden="true">+</span>
              <span className="hidden group-open:inline" aria-hidden="true">−</span>
            </summary>
            <table className="w-full border-t border-line text-sm">
              <tbody>
                {floor.rooms.map((room, index) => (
                  <tr key={index} className="border-b border-line">
                    <th scope="row" className="px-4 py-2 text-left font-normal">{room.name}</th>
                    <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums">{t("m2", { value: formatNumber(room.area) })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-paper-2 font-semibold">
                  <th scope="row" className="px-4 py-2 text-left">{t("floorTotal")}</th>
                  <td className="whitespace-nowrap px-4 py-2 text-right tabular-nums">{t("m2", { value: formatNumber(floor.total) })}</td>
                </tr>
              </tfoot>
            </table>
          </details>
        )}
      </article>
    </div>
  );
}
