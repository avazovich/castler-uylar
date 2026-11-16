"use client";

import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  computeCost, DEFAULT_INPUT, FLOOR_CHOICES, inputFromParams, RANGE,
  type CostInput, type Line, type Stage,
} from "@/lib/buildCost/engine";
import { PRICES_AS_OF, SOURCES, type L } from "@/lib/buildCost/prices";
import { formatNumber } from "@/lib/format";
import { browsePath } from "@/lib/browse";
import { STYLES } from "@/lib/vocab";

type Currency = "uzs" | "usd";
type Rate = { rate: number; date: string };

/** Reads ?area=…&floors=… so a house page can open the calculator filled in. */
export function CostCalculatorFromUrl({ usd }: { usd: Rate }) {
  const params = useSearchParams();
  const initial = useMemo(() => inputFromParams(params), [params]);
  return <CostCalculator key={params.toString()} initial={initial} usd={usd} />;
}

export function CostCalculator({ initial = DEFAULT_INPUT, usd }: { initial?: CostInput; usd: Rate }) {
  const t = useTranslations("calc");
  const locale = useLocale() as "uz" | "ru";
  const [input, setInput] = useState<CostInput>(initial);
  const [currency, setCurrency] = useState<Currency>("uzs");
  const result = useMemo(() => computeCost(input), [input]);
  const set = <K extends keyof CostInput>(key: K, value: CostInput[K]) => setInput((prev) => ({ ...prev, [key]: value }));

  // Keep the address in step, so a visitor can share or reopen their calculation.
  useEffect(() => {
    const q = new URLSearchParams({
      area: String(input.area), floors: String(input.floors), style: input.style, walls: input.walls,
      roof: input.roof, finish: input.finish, plot: String(input.plotSotix), ...(input.basement ? { basement: "1" } : {}), ...(input.fence ? { fence: "1" } : {}), ...(input.paving ? { paving: "1" } : {}),
    });
    window.history.replaceState(null, "", `${window.location.pathname}?${q}`);
  }, [input]);

  const money = moneyFormat(currency, usd.rate, locale);
  const other = moneyFormat(currency === "uzs" ? "usd" : "uzs", usd.rate, locale);
  const tr = (l: L) => l[locale];

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-10">
      {/* ── The visitor's answers ── */}
      <form className="grid gap-6 rounded-xl border border-line bg-paper p-5 md:p-7 lg:sticky lg:top-28" onSubmit={(event) => event.preventDefault()}>
        <h2 className="font-display text-2xl text-ink">{t("answers")}</h2>

        <Field label={t("area")} hint={t("areaHint")}>
          <div className="flex items-center gap-3">
            <input className="field-input w-28 tabular-nums" type="number" inputMode="numeric" min={20} max={2000} step={5}
              value={input.area} onChange={(event) => set("area", Number(event.target.value) || 0)} aria-label={t("area")} />
            <span className="text-ink-soft">m²</span>
            <input className="calc-range flex-1" type="range" min={50} max={600} step={5} value={Math.min(600, Math.max(50, input.area))}
              onChange={(event) => set("area", Number(event.target.value))} aria-hidden="true" tabIndex={-1} />
          </div>
        </Field>

        <Choice legend={t("floors")} hint={t("floorsHint")} value={String(input.floors)}
          options={FLOOR_CHOICES.map((f) => ({ value: String(f), label: formatNumber(f) }))}
          onChange={(value) => set("floors", Number(value) as CostInput["floors"])} />

        <Choice legend={t("style")} value={input.style}
          options={(["modern", "neoclassic", "classic"] as const).map((s) => ({ value: s, label: STYLES[s][locale] }))}
          onChange={(value) => set("style", value as CostInput["style"])} />

        <Choice legend={t("walls")} value={input.walls}
          options={[{ value: "brick", label: t("brick") }, { value: "gasblock", label: t("gasblock") }]}
          onChange={(value) => set("walls", value as CostInput["walls"])} />

        <Choice legend={t("roof")} value={input.roof}
          options={[{ value: "pitched", label: t("pitched") }, { value: "flat", label: t("flat") }]}
          onChange={(value) => set("roof", value as CostInput["roof"])} />

        <fieldset className="grid gap-2">
          <legend className="mb-2 text-sm font-semibold text-ink">{t("finish")}</legend>
          {(["shell", "rough", "turnkey"] as const).map((level) => (
            <label key={level} className={`calc-card ${input.finish === level ? "is-on" : ""}`}>
              <input type="radio" name="finish" className="sr-only" checked={input.finish === level} onChange={() => set("finish", level)} />
              <span className="font-semibold text-ink">{t(level)}</span>
              <span className="text-[13px] leading-snug text-ink-soft">{t(`${level}Hint`)}</span>
            </label>
          ))}
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="mb-1 text-sm font-semibold text-ink">{t("more")}</legend>
          <Toggle label={t("basement")} checked={input.basement} onChange={(v) => set("basement", v)} />
          <Toggle label={t("fence")} checked={input.fence} onChange={(v) => set("fence", v)} />
          <Toggle label={t("paving")} checked={input.paving} onChange={(v) => set("paving", v)} />
          {(input.fence || input.paving) && (
            <Field label={t("plot")}>
              <div className="flex items-center gap-3">
                <input className="field-input w-28 tabular-nums" type="number" inputMode="decimal" min={1} max={100} step={0.5}
                  value={input.plotSotix} onChange={(event) => set("plotSotix", Number(event.target.value) || 0)} aria-label={t("plot")} />
                <span className="text-ink-soft">{t("sotix")}</span>
              </div>
            </Field>
          )}
        </fieldset>
      </form>

      {/* ── The answer ── */}
      <div className="grid min-w-0 gap-5">
        <section id="calc-result" className="scroll-mt-24 rounded-xl bg-ink p-6 text-paper md:p-8" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <p className="text-[12.5px] font-semibold uppercase tracking-[0.12em] text-gold-light">{t("total")}</p>
            <div className="flex rounded-md border border-line-on-ink p-0.5 text-[13px]" role="group" aria-label={t("currency")}>
              {(["uzs", "usd"] as const).map((c) => (
                <button key={c} type="button" aria-pressed={currency === c} onClick={() => setCurrency(c)}
                  className={`rounded px-3 py-1.5 font-semibold transition-colors ${currency === c ? "bg-paper text-ink" : "text-paper/70 hover:text-paper"}`}>
                  {c === "uzs" ? t("som") : "USD"}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 font-display text-[44px] leading-none tabular-nums md:text-[60px]">{money.big(result.totalUzs)}</p>
          <p className="mt-2 text-paper/70 tabular-nums">≈ {other.big(result.totalUzs)}</p>
          <dl className="mt-6 grid gap-4 border-t border-line-on-ink pt-5 sm:grid-cols-3">
            <Stat label={t("perM2")} value={money.big(result.perM2Uzs)} />
            <Stat label={t("materials")} value={money.big(result.materialsUzs + result.bothUzs)} />
            <Stat label={t("labour")} value={money.big(result.labourUzs)} />
          </dl>
          <p className="mt-5 text-sm text-paper/70">
            {t("range", { pct: RANGE * 100, low: money.big(result.lowUzs), high: money.big(result.highUzs) })}
          </p>
        </section>

        <section className="rounded-xl border border-line bg-paper">
          <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-4 md:px-7">
            <h2 className="font-display text-2xl text-ink">{t("breakdown")}</h2>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-soft">
              <span className="inline-flex items-center gap-1.5"><Dot source="market" />{t("legendMarket")}</span>
              <span className="inline-flex items-center gap-1.5"><Dot source="estimate" />{t("legendEstimate")}</span>
            </p>
          </div>
          <ol>
            {result.stages.map((stage, index) => (
              <StageRow key={stage.id} stage={stage} total={result.totalUzs} open={index < 2} money={money} tr={tr} usta={t("usta")} />
            ))}
          </ol>
          <p className="border-t border-line px-5 py-4 text-[13px] text-ink-soft md:px-7">
            {t("geometry", {
              footprint: formatNumber(Math.round(result.geometry.footprint)),
              perimeter: formatNumber(Math.round(result.geometry.perimeter)),
              height: formatNumber(result.geometry.storeyHeight),
              windows: formatNumber(Math.round(result.geometry.windowsM2)),
            })}
            {result.bothUzs > 0 && ` ${t("bothNote", { amount: money.big(result.bothUzs) })}`}
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center rounded-xl border border-line bg-cream p-5 md:p-7">
          <div>
            <h2 className="font-display text-2xl text-ink">{t("ctaTitle")}</h2>
            <p className="mt-2 max-w-xl text-ink-soft">{t("ctaText")}</p>
          </div>
          <Link href={browsePath("consult")} className="btn bg-gold text-paper hover:bg-ink">{t("cta")} →</Link>
        </section>

        <details className="rounded-xl border border-line bg-paper px-5 py-4 text-[14px] text-ink-soft md:px-7">
          <summary className="cursor-pointer font-semibold text-ink">{t("sources")}</summary>
          <p className="mt-3">{t("asOf", { date: tr(PRICES_AS_OF), rate: formatNumber(usd.rate), rateDate: usd.date })}</p>
          <p className="mt-2">{t("note")}</p>
          <ul className="mt-3 grid gap-1.5">
            {SOURCES.map((source) => (
              <li key={source.url}><a className="underline decoration-line underline-offset-4 hover:text-ink" href={source.url} target="_blank" rel="noopener noreferrer">{tr(source.label)}</a></li>
            ))}
          </ul>
        </details>
      </div>

      {/* Phones: the price stays in sight while the visitor changes their answers. */}
      <div className="action-bar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
        <div className="flex items-center gap-3 px-4 py-2.5">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-bold uppercase tracking-wider text-ink-soft">{t("total")}</p>
            <p className="whitespace-nowrap font-display text-[18px] leading-tight tabular-nums">{money.big(result.totalUzs)}</p>
          </div>
          <a href="#calc-result" className="h-12 shrink-0 content-center rounded-lg bg-accent px-4 text-[13.5px] font-black text-[#21150e] active:bg-accent-hover">{t("seeBreakdown")}</a>
        </div>
      </div>
    </div>
  );
}

function StageRow({ stage, total, open, money, tr, usta }: {
  stage: Stage; total: number; open: boolean; money: Money; tr: (l: L) => string; usta: string;
}) {
  const share = total > 0 ? stage.totalUzs / total : 0;
  return (
    <li className="border-b border-line last:border-b-0">
      <details open={open} className="group">
        <summary className="grid cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-cream/60 md:grid-cols-[minmax(0,1fr)_140px_auto] md:px-7 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 font-semibold text-ink">
            <svg className="h-3.5 w-3.5 shrink-0 text-ink-soft transition-transform group-open:rotate-90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            {tr(stage.label)}
          </span>
          <span className="col-span-2 row-start-2 h-1.5 overflow-hidden rounded-full bg-line md:col-span-1 md:row-start-auto" aria-hidden="true">
            <span className="block h-full rounded-full bg-gold" style={{ width: `${Math.max(2, share * 100)}%` }} />
          </span>
          <span className="text-right tabular-nums">
            <span className="font-semibold text-ink">{money.big(stage.totalUzs)}</span>
            <span className="ml-2 inline-block w-9 text-[13px] text-ink-soft">{Math.round(share * 100)}%</span>
          </span>
        </summary>
        <ul className="px-5 pb-4 md:px-7">
          {stage.lines.map((line) => <LineRow key={line.id} line={line} money={money} tr={tr} usta={usta} />)}
        </ul>
      </details>
    </li>
  );
}

function LineRow({ line, money, tr, usta }: { line: Line; money: Money; tr: (l: L) => string; usta: string }) {
  const hasUnit = line.kind !== "other";
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-t border-dashed border-line py-2.5 text-[14.5px] first:border-t-0">
      <span className="text-ink">
        {line.kind === "labour" && <span className="mr-2 rounded bg-gold/10 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold">{usta}</span>}
        {capitalize(tr(line.label).replace(/^(Usta|Работа): /, ""))}
      </span>
      <span className="text-right font-semibold tabular-nums text-ink">{money.full(line.totalUzs)}</span>
      {hasUnit && (
        <span className="col-span-2 mt-0.5 inline-flex items-center gap-1.5 text-[13px] tabular-nums text-ink-soft">
          <Dot source={line.source} />
          {formatNumber(line.qty)} {tr(line.unit)} × {money.unit(line.unitUzs)}
        </span>
      )}
    </li>
  );
}

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase() + text.slice(1);

function Dot({ source }: { source: "market" | "estimate" }) {
  return source === "market"
    ? <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-ink" aria-hidden="true" />
    : <span className="inline-block h-2 w-2 shrink-0 rounded-full border-[1.5px] border-accent" aria-hidden="true" />;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[13px] text-paper/60">{label}</dt>
      <dd className="mt-1 text-lg font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className="text-sm font-semibold text-ink">{label}{hint && <span className="ml-2 font-normal text-ink-soft">{hint}</span>}</span>
      {children}
    </div>
  );
}

function Choice({ legend, hint, value, options, onChange }: {
  legend: string; hint?: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void;
}) {
  const name = useId();
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">{legend}{hint && <span className="ml-2 font-normal text-ink-soft">{hint}</span>}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <label key={option.value} className={`calc-pill ${value === option.value ? "is-on" : ""}`}>
            <input type="radio" name={name} className="sr-only" checked={value === option.value} onChange={() => onChange(option.value)} />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 text-[15px] text-ink">
      {label}
      <input type="checkbox" className="calc-switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

type Money = ReturnType<typeof moneyFormat>;

/** so‘m: "803 mln so‘m" for totals, "1 050 so‘m" for unit prices; dollars: "$66 872", "$0,09". */
function moneyFormat(currency: Currency, rate: number, locale: "uz" | "ru") {
  const som = locale === "uz" ? "so‘m" : "сум";
  const mln = locale === "uz" ? "mln" : "млн";
  const usd = (n: number) => n / rate;
  const dollars = (n: number) => (n < 10 ? `$${n.toFixed(2).replace(".", ",")}` : `$${formatNumber(Math.round(n))}`);
  return {
    big: (uzs: number) => currency === "usd" ? dollars(usd(uzs))
      : uzs >= 1e6 ? `${formatNumber(uzs >= 1e8 ? Math.round(uzs / 1e6) : Math.round(uzs / 1e5) / 10)} ${mln} ${som}` : `${formatNumber(Math.round(uzs))} ${som}`,
    full: (uzs: number) => currency === "usd" ? dollars(usd(uzs)) : `${formatNumber(Math.round(uzs / 1000) * 1000)} ${som}`,
    unit: (uzs: number) => currency === "usd" ? dollars(usd(uzs)) : `${formatNumber(Math.round(uzs))} ${som}`,
  };
}
