"use client";

import { formatNumber } from "@/lib/format";
import { COST_PARTS, type CostPart } from "@/lib/vocab";
import { newKey, parseNumber, type AdminCost } from "@/lib/admin/types";
import { DecimalInput, PriceInput, Select, TextInput } from "./fields";

const PART_OPTIONS = Object.entries(COST_PARTS).map(([value, l]) => ({ value, label: l.uz }));

export function CostsEditor({
  costs,
  update,
  errors,
}: {
  costs: AdminCost[];
  update: (fn: (prev: AdminCost[]) => AdminCost[]) => void;
  errors: Record<string, string>;
}) {
  const set = (key: string, patch: Partial<AdminCost>) =>
    update((prev) => prev.map((c) => (c.key === key ? { ...c, ...patch } : c)));
  const total = costs.reduce((s, c) => {
    const n = parseNumber(c.costUsd);
    return s + (n && !Number.isNaN(n) ? n : 0);
  }, 0);

  return (
    <div>
      {costs.length === 0 && <p className="mb-4 text-ink-soft">Bo&apos;lim bo&apos;sh bo&apos;lsa, saytda ko&apos;rsatilmaydi.</p>}
      {costs.length > 0 && (
        <div className="hidden grid-cols-[minmax(0,1fr)_120px_150px_40px] gap-2 pb-2 sm:grid">
          <span className="label-caps text-ink-soft">Qism</span>
          <span className="label-caps text-ink-soft">Maydon</span>
          <span className="label-caps text-ink-soft">Narx (dollar)</span>
        </div>
      )}
      <div className="flex flex-col gap-2">
        {costs.map((c) => (
          <div key={c.key}>
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_40px] gap-2 sm:grid-cols-[minmax(0,1fr)_120px_150px_40px]">
              <div className="col-span-3 sm:col-span-1">
                <Select value={c.part} onChange={(v) => set(c.key, { part: v as CostPart })} options={PART_OPTIONS} placeholder="Qismni tanlang" />
              </div>
              <DecimalInput value={c.area} onChange={(v) => set(c.key, { area: v })} suffix="m²" placeholder="ixtiyoriy" />
              <PriceInput value={c.costUsd} onChange={(v) => set(c.key, { costUsd: v })} suffix="$" error={errors[`cost-${c.key}`]} />
              <button
                type="button"
                onClick={() => update((prev) => prev.filter((x) => x.key !== c.key))}
                className="grid place-items-center border border-line text-ink-soft hover:border-red-700 hover:text-red-700"
                aria-label="Qatorni o'chirish"
              >
                ×
              </button>
            </div>
            {c.part === "other" && (
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <TextInput value={c.customUz} onChange={(v) => set(c.key, { customUz: v })} placeholder="Nomi (o'zbekcha)" />
                <TextInput value={c.customRu} onChange={(v) => set(c.key, { customRu: v })} placeholder="Название (по-русски)" />
              </div>
            )}
            {errors[`cost-${c.key}`] && <p className="mt-1 text-sm text-red-700">{errors[`cost-${c.key}`]}</p>}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => update((prev) => [...prev, { key: newKey(), part: "", customUz: "", customRu: "", area: "", costUsd: "" }])}
          className="btn border border-line px-4 py-2.5 text-ink hover:border-ink"
        >
          + Qator qo&apos;shish
        </button>
        {costs.length > 0 && (
          <p className="text-ink-soft">
            Jami: <b className="text-ink">${formatNumber(total)}</b>
          </p>
        )}
      </div>
    </div>
  );
}
