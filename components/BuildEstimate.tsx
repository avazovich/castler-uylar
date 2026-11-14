"use client";

import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";

export function BuildEstimate() {
  const t = useTranslations("browse");
  const format = useFormatter();
  const [estimate, setEstimate] = useState<number>();

  return (
    <form className="grid max-w-xl gap-4 rounded-xl border border-line bg-paper p-5 sm:grid-cols-2" onSubmit={(event) => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      setEstimate(Number(data.get("area")) * Number(data.get("rate")));
    }}>
      <label>{t("area")}<input className="field-input mt-1" name="area" type="number" min="1" max="100000" required /></label>
      <label>{t("rate")}<input className="field-input mt-1" name="rate" type="number" min="1" max="1000000000" required /></label>
      <button className="btn bg-gold text-white sm:col-span-2">{t("calculate")}</button>
      {estimate !== undefined && <output className="sm:col-span-2">{t("estimate", { amount: format.number(estimate) })}</output>}
    </form>
  );
}
