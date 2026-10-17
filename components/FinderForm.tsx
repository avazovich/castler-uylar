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
      className="grid gap-3 rounded-3xl bg-paper p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)] sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end sm:p-4"
    >
      {fields.map((f) => (
        <label key={f.id} className="block min-w-0">
          <span className="label-mono mb-1.5 block px-1 text-ink-soft">{f.label}</span>
          <select
            className="field-select"
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
      <button type="submit" className="pill h-[50px] bg-ink px-6 text-paper hover:bg-ink-2">
        {t("find")}
        <ArrowRightIcon className="h-4 w-4" />
      </button>
    </form>
  );
}
