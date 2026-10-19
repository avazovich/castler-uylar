"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { filtersToQuery, PLOT_OPTIONS, WIDTH_OPTIONS } from "@/lib/filters";
import { formatNumber } from "@/lib/format";
import { ArrowRightIcon } from "./icons";

/** Home-page quick search — hands off to the catalog with the filters in the URL. */
export function FinderForm({ floorOptions }: { floorOptions: number[] }) {
  const t = useTranslations("filters");
  const th = useTranslations("home");
  const router = useRouter();
  const [sotix, setSotix] = useState("");
  const [qavat, setQavat] = useState("");
  const [eni, setEni] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const qs = filtersToQuery({
      sotix: sotix ? Number(sotix) : undefined,
      qavat: qavat ? Number(qavat) : undefined,
      eni: eni ? Number(eni) : undefined,
      sort: "new",
    });
    router.push(qs ? `/loyihalar?${qs}` : "/loyihalar");
  }

  const fields = [
    {
      id: "sotix",
      label: t("plot"),
      value: sotix,
      set: setSotix,
      options: PLOT_OPTIONS.map((v) => ({ value: v, label: t("plotOption", { value: formatNumber(v) }) })),
    },
    {
      id: "qavat",
      label: t("floors"),
      value: qavat,
      set: setQavat,
      options: floorOptions.map((v) => ({ value: v, label: t("floorsOption", { count: v, label: formatNumber(v) }) })),
    },
    {
      id: "eni",
      label: t("width"),
      value: eni,
      set: setEni,
      options: WIDTH_OPTIONS.map((v) => ({ value: v, label: t("widthOption", { value: v }) })),
    },
  ];

  return (
    <form
      onSubmit={submit}
      className="grid border border-line bg-paper shadow-[0_28px_60px_-34px_rgba(26,29,22,0.55)] sm:grid-cols-3 lg:grid-cols-[210px_1fr_1fr_1fr_220px]"
    >
      <div className="flex items-center bg-ink px-6 py-4 sm:col-span-3 lg:col-span-1 lg:py-0">
        <p className="font-display text-[26px] leading-tight text-cream">{th("finderTitle")}</p>
      </div>
      {fields.map((f) => (
        <label key={f.id} className="block min-w-0 border-b border-line px-5 py-4 sm:border-r lg:border-b-0">
          <span className="label-caps block text-ink-soft">{f.label}</span>
          <select
            className="field-select border-0 bg-[position:right_0_center] px-0 pb-0 pt-1.5 text-[16px]"
            value={f.value}
            data-active={f.value !== ""}
            onChange={(e) => f.set(e.target.value)}
          >
            <option value="">{t("any")}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      ))}
      <button type="submit" className="btn bg-gold py-5 text-paper hover:bg-ink sm:col-span-3 lg:col-span-1">
        {t("find")}
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </form>
  );
}
