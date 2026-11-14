"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

export function PlotCheck({ width, length, area }: { width: number; length: number; area: number }) {
  const t = useTranslations("browse");
  const [fits, setFits] = useState<boolean>();

  return (
    <details className="rounded-md border border-line bg-[#e9e4d9] p-3.5">
      <summary className="cursor-pointer font-display text-lg">{t("plotCheck")}</summary>
      <form className="mt-3 grid grid-cols-2 gap-2"
        onChange={() => setFits(undefined)}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const w = Number(data.get("width"));
          const l = Number(data.get("length"));
          setFits(w >= width && l >= length && w * l >= area);
        }}>
        <p className="col-span-2 text-sm text-ink-soft">{t("checkPlotHelp")}</p>
        <label className="text-sm">{t("plotWidth")}<input className="field-input" name="width" type="number" min="0.1" step="any" required /></label>
        <label className="text-sm">{t("plotLength")}<input className="field-input" name="length" type="number" min="0.1" step="any" required /></label>
        <button className="btn col-span-2 bg-gold text-white">{t("check")}</button>
        {fits !== undefined && <output className="col-span-2 text-sm">{t(fits ? "fits" : "doesNotFit")}</output>}
      </form>
    </details>
  );
}
