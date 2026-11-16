"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { LeadForm } from "./LeadForm";
import {
  cheaperOptions, computeCost, DEFAULT_INPUT, FLOOR_CHOICES, inputFromParams, RANGE,
  type CostInput, type CostResult, type Floors, type Line, type Stage, type Style,
} from "@/lib/buildCost/engine";
import { PRICES_AS_OF, SOURCES, type L } from "@/lib/buildCost/prices";
import { formatNumber } from "@/lib/format";
import { STYLES } from "@/lib/vocab";

type Currency = "uzs" | "usd";
type Rate = { rate: number; date: string };
type Locale = "uz" | "ru";
export type StyleImages = Partial<Record<Style, { url: string; position: string; lqip?: string }>>;
/** A catalog house, offered on the result when it is close to the visitor's answers. */
export type PlanCard = {
  code: number; name?: string; href: string; totalArea: number; floors: number; style?: Style; priceUzs: number;
  /** The land the house is designed for, in sotix. */
  plotSotix: number;
  cover: { url: string; position: string; lqip?: string };
};
type Extras = { usd: Rate; images: StyleImages; plans: PlanCard[]; phone: string };

/** One question per screen, in this order. */
const STEPS = ["plot", "area", "floors", "style", "walls", "roof", "finish", "extras"] as const;
type StepId = (typeof STEPS)[number];
type View = { kind: "step"; step: number } | { kind: "calculating" } | { kind: "result" };

const AREA_PRESETS = [100, 150, 200, 250, 300, 400] as const;
const PLOT_PRESETS = [4, 5, 6, 8, 10, 15] as const;
const STYLE_IDS: Style[] = ["modern", "neoclassic", "classic"];

/**
 * Where the quiz starts. A shared link with every answer opens straight on the
 * result; a house page's link (land, area, floors, style) skips those four questions.
 */
type Start = { input: CostInput; view: View; prefilled: boolean; answered: StepId[] };

function startFrom(params: URLSearchParams): Start {
  const input = inputFromParams(params);
  if (params.has("area") && params.has("finish")) return { input, view: { kind: "result" }, prefilled: false, answered: [...STEPS] };
  if (params.has("area") && params.has("floors") && params.has("style")) {
    return { input, view: { kind: "step", step: STEPS.indexOf("walls") }, prefilled: true, answered: ["plot", "area", "floors", "style"] };
  }
  return FRESH;
}

const FRESH: Start = { input: DEFAULT_INPUT, view: { kind: "step", step: 0 }, prefilled: false, answered: [] };

export function CostCalculatorFromUrl(props: Extras) {
  const params = useSearchParams();
  const start = useMemo(() => startFrom(new URLSearchParams(params.toString())), [params]);
  return <CostCalculator {...props} start={start} />;
}

export function CostCalculator({ usd, images, plans, phone, start }: Extras & { start?: Start }) {
  const t = useTranslations("calc");
  const locale = useLocale() as Locale;
  const [input, setInput] = useState<CostInput>(start?.input ?? DEFAULT_INPUT);
  const [view, setView] = useState<View>(start?.view ?? { kind: "step", step: 0 });
  const [prefilled, setPrefilled] = useState(start?.prefilled ?? false);
  /** Questions the visitor has answered — only those show a chosen card. */
  const [answered, setAnswered] = useState<StepId[]>(start?.answered ?? []);
  const markAnswered = (step: StepId) => setAnswered((prev) => (prev.includes(step) ? prev : [...prev, step]));
  /** True while the visitor changes one answer from the result: the next answer goes straight back. */
  const [editing, setEditing] = useState(false);
  const [currency, setCurrency] = useState<Currency>("uzs");
  const result = useMemo(() => computeCost(input), [input]);
  const topRef = useRef<HTMLDivElement>(null);
  const advance = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(advance.current), []);

  // The short "calculating" moment before the price appears.
  useEffect(() => {
    if (view.kind !== "calculating") return;
    const id = window.setTimeout(() => setView({ kind: "result" }), reducedMotion() ? 0 : 1400);
    return () => window.clearTimeout(id);
  }, [view.kind]);

  // A finished calculation keeps its answers in the address, so it can be shared or reopened.
  useEffect(() => {
    if (view.kind !== "result") return;
    window.history.replaceState(null, "", `${window.location.pathname}?${answersQuery(input)}`);
  }, [view.kind, input]);

  const show = (next: View) => {
    window.clearTimeout(advance.current);
    setView(next);
    const top = topRef.current;
    if (top && top.getBoundingClientRect().top < 80) top.scrollIntoView({ block: "start", behavior: reducedMotion() ? "auto" : "smooth" });
  };
  const reveal = () => { setEditing(false); setPrefilled(false); show({ kind: "calculating" }); };
  const next = () => {
    if (view.kind !== "step") return;
    if (editing || view.step === STEPS.length - 1) reveal();
    else show({ kind: "step", step: view.step + 1 });
  };
  const back = () => {
    if (view.kind !== "step") return;
    if (editing) { setEditing(false); show({ kind: "result" }); } else if (view.step > 0) show({ kind: "step", step: view.step - 1 });
  };
  const set = <K extends keyof CostInput>(key: K, value: CostInput[K]) => setInput((prev) => ({ ...prev, [key]: value }));
  /** A single-choice answer: mark it, then move on a beat later so the choice is seen. */
  const choose = <K extends keyof CostInput>(key: K, value: CostInput[K]) => {
    set(key, value);
    if (view.kind === "step") markAnswered(STEPS[view.step]);
    window.clearTimeout(advance.current);
    advance.current = window.setTimeout(next, reducedMotion() ? 0 : 260);
  };
  const edit = (step: StepId) => { setEditing(true); show({ kind: "step", step: STEPS.indexOf(step) }); };
  const restart = () => { setEditing(false); setPrefilled(false); setAnswered([]); setInput(DEFAULT_INPUT); show({ kind: "step", step: 0 }); };

  return (
    <div ref={topRef} className="mx-auto max-w-[920px] scroll-mt-28">
      {view.kind === "step" && (
        <StepView
          step={STEPS[view.step]} index={view.step} input={input} images={images} locale={locale}
          answered={answered.includes(STEPS[view.step])} editing={editing} prefilled={prefilled}
          set={set} choose={choose} next={() => { markAnswered(STEPS[view.step]); next(); }} back={back}
        />
      )}
      {view.kind === "calculating" && <Calculating />}
      {view.kind === "result" && (
        <ResultView
          input={input} result={result} usd={usd} locale={locale} currency={currency} plans={plans} phone={phone}
          setCurrency={setCurrency} edit={edit} restart={restart} t={t}
          apply={(change) => setInput((prev) => ({ ...prev, ...change }))}
        />
      )}
    </div>
  );
}

// ───────────────────────────── Questions ─────────────────────────────

function StepView({ step, index, input, images, locale, answered, editing, prefilled, set, choose, next, back }: {
  step: StepId; index: number; input: CostInput; images: StyleImages; locale: Locale; answered: boolean; editing: boolean; prefilled: boolean;
  set: <K extends keyof CostInput>(key: K, value: CostInput[K]) => void;
  choose: <K extends keyof CostInput>(key: K, value: CostInput[K]) => void;
  next: () => void; back: () => void;
}) {
  const t = useTranslations("calc");
  const [customArea, setCustomArea] = useState(AREA_PRESETS.includes(input.area as never) ? "" : String(input.area));
  const [customPlot, setCustomPlot] = useState(PLOT_PRESETS.includes(input.plotSotix as never) ? "" : String(input.plotSotix));
  const plotOk = Number(customPlot) >= 1 && Number(customPlot) <= 100;
  const progress = ((index + 1) / STEPS.length) * 100;
  /** The chosen card, once this question has an answer. */
  const picked = (match: boolean) => answered && match;

  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-paper shadow-[0_18px_50px_-30px_rgb(26_29_22/0.35)]">
      <header className="flex items-center justify-between gap-4 px-5 pt-5 md:px-10 md:pt-8">
        {editing || index > 0 ? (
          <button type="button" onClick={back} className="inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-ink-soft hover:text-ink">
            <span aria-hidden="true">←</span> {editing ? t("backToResult") : t("back")}
          </button>
        ) : <span />}
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-soft tabular-nums">
          {t("stepOf", { n: index + 1, total: STEPS.length })}
        </p>
      </header>
      <div className="mx-5 mt-4 h-1 overflow-hidden rounded-full bg-line md:mx-10" aria-hidden="true">
        <div className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div key={step} className="calc-enter px-5 pb-6 pt-7 md:px-10 md:pb-10 md:pt-9">
        {prefilled && (
          <p className="mb-5 rounded-lg bg-cream px-4 py-3 text-[14px] text-ink">
            {t("prefilled", { area: formatNumber(input.area), floors: formatNumber(input.floors), style: STYLES[input.style][locale] })}
          </p>
        )}
        <h2 className="font-display text-[30px] leading-[1.12] text-ink text-balance md:text-[40px]">{t(`q.${step}`)}</h2>
        <p className="mt-3 max-w-xl text-ink-soft">{t(`q.${step}Hint`)}</p>

        <div className="mt-7 md:mt-9">
          {step === "plot" && (
            <>
              <div className="stagger-always stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
                {PLOT_PRESETS.map((plot) => (
                  <Option key={plot} on={picked(input.plotSotix === plot && !customPlot)} onClick={() => { setCustomPlot(""); choose("plotSotix", plot); }}>
                    <span className="font-display text-[30px] leading-none text-ink tabular-nums">{plot}<span className="ml-1.5 text-[18px]">{t("sotixUnit")}</span></span>
                    <span className="mt-2 text-[14px] text-ink-soft tabular-nums">{formatNumber(plot * 100)} m²</span>
                  </Option>
                ))}
              </div>
              <form
                className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-line p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (plotOk) { set("plotSotix", Math.round(Number(customPlot) * 10) / 10); next(); }
                }}>
                <label htmlFor="calc-plot" className="text-[15px] font-semibold text-ink">{t("otherPlot")}</label>
                <div className="flex items-center gap-2">
                  <input id="calc-plot" className="field-input w-28 tabular-nums" type="number" inputMode="decimal" min={1} max={100} step={0.5}
                    placeholder="7" value={customPlot} onChange={(event) => setCustomPlot(event.target.value)} />
                  <span className="text-ink-soft">{t("sotixUnit")}</span>
                </div>
                <button className="btn ml-auto bg-ink text-paper hover:bg-gold disabled:opacity-40" disabled={!plotOk}>{t("next")} →</button>
              </form>
            </>
          )}

          {step === "area" && (
            <>
              <div className="stagger-always stagger grid grid-cols-2 gap-3 sm:grid-cols-3">
                {AREA_PRESETS.map((area) => (
                  <Option key={area} on={picked(input.area === area && !customArea)} onClick={() => { setCustomArea(""); choose("area", area); }}>
                    <span className="font-display text-[30px] leading-none text-ink tabular-nums">{area}<span className="ml-1 text-[18px]">m²</span></span>
                    <span className="mt-2 text-[14px] text-ink-soft">{t(`areaLabel.a${area}`)}</span>
                  </Option>
                ))}
              </div>
              <form
                className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-line p-4"
                onSubmit={(event) => {
                  event.preventDefault();
                  const value = Number(customArea);
                  if (value >= 20 && value <= 2000) { set("area", Math.round(value)); next(); }
                }}>
                <label htmlFor="calc-area" className="text-[15px] font-semibold text-ink">{t("otherArea")}</label>
                <div className="flex items-center gap-2">
                  <input id="calc-area" className="field-input w-28 tabular-nums" type="number" inputMode="numeric" min={20} max={2000}
                    placeholder="180" value={customArea} onChange={(event) => setCustomArea(event.target.value)} />
                  <span className="text-ink-soft">m²</span>
                </div>
                <button className="btn ml-auto bg-ink text-paper hover:bg-gold disabled:opacity-40" disabled={!(Number(customArea) >= 20 && Number(customArea) <= 2000)}>
                  {t("next")} →
                </button>
              </form>
            </>
          )}

          {step === "floors" && (
            <div className="stagger-always stagger grid grid-cols-2 gap-3 sm:grid-cols-5">
              {FLOOR_CHOICES.map((floors) => (
                <Option key={floors} on={picked(input.floors === floors)} onClick={() => choose("floors", floors)} center>
                  <FloorsIcon floors={floors} />
                  <span className="mt-3 font-semibold text-ink">{t("floorsLabel", { n: formatNumber(floors) })}</span>
                  {floors % 1 !== 0 && <span className="text-[13px] text-ink-soft">{t("attic")}</span>}
                </Option>
              ))}
            </div>
          )}

          {step === "style" && (
            <div className="stagger-always stagger grid gap-3 sm:grid-cols-3">
              {STYLE_IDS.map((style) => {
                const image = images[style];
                return (
                  <Option key={style} on={picked(input.style === style)} onClick={() => choose("style", style)} flush>
                    <span className="relative block aspect-[4/3] w-full overflow-hidden bg-cream">
                      {image && (
                        <Image src={image.url} alt="" fill sizes="(min-width: 640px) 290px, 100vw" className="object-cover"
                          style={{ objectPosition: image.position }} placeholder={image.lqip ? "blur" : "empty"} blurDataURL={image.lqip} />
                      )}
                    </span>
                    <span className="block p-4">
                      <span className="block font-semibold text-ink">{STYLES[style][locale]}</span>
                      <span className="mt-1 block text-[14px] leading-snug text-ink-soft">{t(`styleDesc.${style}`)}</span>
                    </span>
                  </Option>
                );
              })}
            </div>
          )}

          {step === "walls" && (
            <div className="stagger-always stagger grid gap-3 sm:grid-cols-2">
              {(["brick", "gasblock"] as const).map((walls) => (
                <Option key={walls} on={picked(input.walls === walls)} onClick={() => choose("walls", walls)} row>
                  <WallIcon kind={walls} />
                  <span>
                    <span className="block font-semibold text-ink">{t(walls)}</span>
                    <span className="mt-1 block text-[14px] leading-snug text-ink-soft">{t(`${walls}Desc`)}</span>
                  </span>
                </Option>
              ))}
            </div>
          )}

          {step === "roof" && (
            <div className="stagger-always stagger grid gap-3 sm:grid-cols-2">
              {(["pitched", "flat"] as const).map((roof) => (
                <Option key={roof} on={picked(input.roof === roof)} onClick={() => choose("roof", roof)} row>
                  <RoofIcon kind={roof} />
                  <span>
                    <span className="block font-semibold text-ink">{t(roof)}</span>
                    <span className="mt-1 block text-[14px] leading-snug text-ink-soft">{t(`${roof}Desc`)}</span>
                  </span>
                </Option>
              ))}
            </div>
          )}

          {step === "finish" && (
            <div className="stagger-always stagger grid gap-3 md:grid-cols-3">
              {(["shell", "rough", "turnkey"] as const).map((finish, level) => (
                <Option key={finish} on={picked(input.finish === finish)} onClick={() => choose("finish", finish)}>
                  <LevelBar level={level} />
                  <span className="mt-4 block font-semibold text-ink">{t(finish)}</span>
                  <ul className="mt-2 grid gap-1 text-[14px] leading-snug text-ink-soft">
                    {(t.raw(`${finish}Items`) as string[]).map((item) => <li key={item} className="flex gap-2"><span aria-hidden="true" className="text-gold">·</span>{item}</li>)}
                  </ul>
                </Option>
              ))}
            </div>
          )}

          {step === "extras" && (
            <>
              <div className="stagger-always stagger grid gap-3 sm:grid-cols-3">
                {(["basement", "fence", "paving"] as const).map((extra) => (
                  <Option key={extra} on={input[extra]} onClick={() => set(extra, !input[extra])} check>
                    <span className="block font-semibold text-ink">{t(extra)}</span>
                    <span className="mt-1 block text-[14px] leading-snug text-ink-soft">{t(`${extra}Desc`)}</span>
                  </Option>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button type="button" onClick={next} className="btn bg-gold text-paper hover:bg-ink">{t("showPrice")} →</button>
                {!input.basement && !input.fence && !input.paving && <span className="text-[14px] text-ink-soft">{t("nothingExtra")}</span>}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/** A big tappable answer card. */
function Option({ on, onClick, children, center, row, flush, check }: {
  on: boolean; onClick: () => void; children: React.ReactNode; center?: boolean; row?: boolean; flush?: boolean; check?: boolean;
}) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={`calc-option ${flush ? "overflow-hidden p-0" : "p-4 md:p-5"} ${center ? "items-center text-center" : "items-start text-left"} ${row ? "flex-row items-center gap-4" : "flex-col"}`}>
      {children}
      <span className={`calc-tick ${check ? "is-check" : ""}`} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5 10 17 19 7.5" /></svg>
      </span>
    </button>
  );
}

function Calculating() {
  const t = useTranslations("calc");
  return (
    <section className="calc-enter grid min-h-[420px] place-items-center rounded-2xl border border-line bg-paper px-6 py-14 text-center" role="status">
      <div>
        <div className="calc-spinner mx-auto" aria-hidden="true" />
        <p className="mt-6 font-display text-[30px] text-ink">{t("calculating")}</p>
        <ul className="calc-ticker mt-5 grid gap-2 text-ink-soft">
          {(t.raw("calcLines") as string[]).map((line) => <li key={line}>{line}</li>)}
        </ul>
      </div>
    </section>
  );
}

// ───────────────────────────── The price ─────────────────────────────

function ResultView({ input, result, usd, locale, currency, plans, phone, setCurrency, edit, restart, apply, t }: {
  input: CostInput; result: CostResult; usd: Rate; locale: Locale; currency: Currency; plans: PlanCard[]; phone: string;
  setCurrency: (currency: Currency) => void; edit: (step: StepId) => void; restart: () => void;
  apply: (change: Partial<CostInput>) => void;
  t: ReturnType<typeof useTranslations<"calc">>;
}) {
  const money = moneyFormat(currency, usd.rate, locale);
  const other = moneyFormat(currency === "uzs" ? "usd" : "uzs", usd.rate, locale);
  const shown = useCountUp(result.totalUzs);
  const tr = (l: L) => l[locale];
  const savings = cheaperOptions(input);
  const matches = matchPlans(plans, input);
  const extras = result.stages.find((stage) => stage.id === "extra")?.totalUzs ?? 0;
  const split = [
    { key: "materials", value: result.materialsUzs + result.bothUzs, className: "bg-gold" },
    { key: "labour", value: result.labourUzs, className: "bg-paper" },
    { key: "reserve", value: extras, className: "bg-[#8d8a7c]" },
  ] as const;
  const answers: { step: StepId; label: string }[] = [
    { step: "plot", label: t("sotix", { n: formatNumber(input.plotSotix) }) },
    { step: "area", label: `${formatNumber(input.area)} m²` },
    { step: "floors", label: t("floorsLabel", { n: formatNumber(input.floors) }) },
    { step: "style", label: STYLES[input.style][locale] },
    { step: "walls", label: t(input.walls) },
    { step: "roof", label: t(input.roof) },
    { step: "finish", label: t(input.finish) },
    ...(input.basement ? [{ step: "extras" as const, label: t("basement") }] : []),
    ...(input.fence ? [{ step: "extras" as const, label: t("fence") }] : []),
    ...(input.paving ? [{ step: "extras" as const, label: t("paving") }] : []),
  ];

  return (
    <div className="calc-enter grid gap-5">
      <div>
        <div className="mb-2.5 flex items-baseline justify-between gap-4">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-soft">{t("yourAnswers")}</p>
          <button type="button" onClick={restart} className="min-h-11 whitespace-nowrap text-[14px] font-semibold text-ink-soft underline-offset-4 hover:text-ink hover:underline">
            ↺ {t("restart")}
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {answers.map((answer) => (
            <button key={answer.label} type="button" onClick={() => edit(answer.step)} className="calc-chip" title={t("editHint")}>
              {answer.label} <span aria-hidden="true" className="text-ink-soft">✎</span>
            </button>
          ))}
        </div>
      </div>

      <section className="rounded-2xl bg-ink p-6 text-paper md:p-10" aria-live="polite">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-gold-light">{t("total")}</p>
          <div className="flex rounded-md border border-line-on-ink p-0.5 text-[13px]" role="group" aria-label={t("currency")}>
            {(["uzs", "usd"] as const).map((c) => (
              <button key={c} type="button" aria-pressed={currency === c} onClick={() => setCurrency(c)}
                className={`min-h-9 rounded px-3 font-semibold transition-colors ${currency === c ? "bg-paper text-ink" : "text-paper/70 hover:text-paper"}`}>
                {c === "uzs" ? t("som") : "USD"}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 font-display text-[40px] leading-none tabular-nums sm:text-[52px] md:text-[72px]">{money.big(shown)}</p>
        <p className="mt-3 text-paper/70 tabular-nums">≈ {other.big(result.totalUzs)} · {t("perM2", { amount: money.big(result.perM2Uzs) })}</p>

        <div className="mt-8 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
          {split.map((part) => <span key={part.key} className={`${part.className} h-full`} style={{ flexGrow: part.value }} />)}
        </div>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          {split.map((part) => (
            <div key={part.key}>
              <dt className="flex items-center gap-2 text-[13px] text-paper/65"><span className={`h-2 w-2 rounded-full ${part.className}`} aria-hidden="true" />{t(part.key)}</dt>
              <dd className="mt-1 text-[17px] font-semibold tabular-nums">{money.big(part.value)}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line-on-ink pt-5">
          <p className="max-w-md text-[14px] text-paper/70">
            {t("range", { pct: RANGE * 100, low: money.big(result.lowUzs), high: money.big(result.highUzs) })}
          </p>
          <a href="#calc-lead" className="btn bg-accent text-[#21150e] hover:bg-accent-hover">{t("ctaJump")} ↓</a>
        </div>
      </section>

      {savings.length > 0 && (
        <section className="rounded-2xl border border-line bg-paper p-5 md:p-8">
          <h2 className="font-display text-[28px] text-ink">{t("saveTitle")}</h2>
          <p className="mt-1 text-[14px] text-ink-soft">{t("saveHint")}</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {savings.map((option) => (
              <article key={option.id} className="flex flex-col rounded-xl border border-line p-4">
                <p className="font-display text-[26px] leading-none text-gold tabular-nums">−{money.big(option.savingUzs)}</p>
                <h3 className="mt-3 font-semibold text-ink">{t(`save.${option.id}`)}</h3>
                <p className="mt-1 flex-1 text-[14px] leading-snug text-ink-soft">
                  {t(`save.${option.id}Why`, {
                    from: STYLES[input.style][locale],
                    to: option.change.style ? STYLES[option.change.style][locale] : "",
                  })}
                </p>
                <button type="button" onClick={() => apply(option.change)} className="calc-chip mt-4 self-start">{t("save.apply")}</button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-line bg-paper">
        <div className="px-5 pb-2 pt-6 md:px-8">
          <h2 className="font-display text-[28px] text-ink">{t("breakdown")}</h2>
          <p className="mt-1 text-[14px] text-ink-soft">{t("breakdownHint")}</p>
          <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-ink-soft">
            <span className="inline-flex items-center gap-1.5"><Dot source="market" />{t("legendMarket")}</span>
            <span className="inline-flex items-center gap-1.5"><Dot source="estimate" />{t("legendEstimate")}</span>
          </p>
        </div>
        <ol className="mt-3">
          {result.stages.map((stage) => (
            <StageRow key={stage.id} stage={stage} total={result.totalUzs} money={money} tr={tr} usta={t("usta")} />
          ))}
        </ol>
        <p className="border-t border-line px-5 py-4 text-[13px] leading-relaxed text-ink-soft md:px-8">
          {t("geometry", {
            footprint: formatNumber(Math.round(result.geometry.footprint)),
            perimeter: formatNumber(Math.round(result.geometry.perimeter)),
            height: formatNumber(result.geometry.storeyHeight),
            windows: formatNumber(Math.round(result.geometry.windowsM2)),
          })}
        </p>
      </section>

      {matches.length > 0 && (
        <section className="rounded-2xl border border-line bg-paper p-5 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[28px] text-ink">{t("plansTitle")}</h2>
              <p className="mt-1 max-w-xl text-[14px] text-ink-soft">{t("plansHint", { plot: formatNumber(input.plotSotix) })}</p>
            </div>
            <Link href="/loyihalar" className="text-[14px] font-semibold text-gold underline-offset-4 hover:underline">{t("allPlans")} →</Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {matches.map((plan) => (
              <Link key={plan.code} href={plan.href} className="group overflow-hidden rounded-xl border border-line transition-shadow hover:shadow-[0_12px_30px_-20px_rgb(26_29_22/0.5)]">
                <span className="relative block aspect-[4/3] overflow-hidden bg-cream">
                  <Image src={plan.cover.url} alt="" fill sizes="(min-width: 640px) 290px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    style={{ objectPosition: plan.cover.position }} placeholder={plan.cover.lqip ? "blur" : "empty"} blurDataURL={plan.cover.lqip} />
                  {plan.plotSotix <= input.plotSotix && (
                    <span className="absolute left-3 top-3 rounded-full bg-paper/95 px-2.5 py-1 text-[12px] font-bold text-ink">✓ {t("fitsPlot")}</span>
                  )}
                </span>
                <span className="block p-4">
                  <span className="block font-semibold text-ink">№{plan.code}{plan.name ? ` · ${plan.name}` : ""}</span>
                  <span className="mt-1 block text-[14px] text-ink-soft">
                    {formatNumber(plan.totalArea)} m² · {t("floorsLabel", { n: formatNumber(plan.floors) })} · {t("sotix", { n: formatNumber(plan.plotSotix) })}
                  </span>
                  <span className="mt-3 block text-[14px] text-ink">{t("planPrice", { amount: moneyFormat("uzs", usd.rate, locale).unit(plan.priceUzs) })}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section id="calc-lead" className="grid scroll-mt-28 gap-6 rounded-2xl bg-ink p-6 text-paper md:grid-cols-[minmax(0,1fr)_minmax(0,420px)] md:p-10">
        <div>
          <p className="text-[12.5px] font-semibold uppercase tracking-[0.14em] text-gold-light">{t("leadEyebrow")}</p>
          <h2 className="mt-3 font-display text-[32px] leading-tight md:text-[38px]">{t("leadTitle")}</h2>
          <ul className="mt-6 grid gap-3">
            {(t.raw("leadPoints") as string[]).map((point) => (
              <li key={point} className="flex gap-3 text-paper/85">
                <svg className="mt-0.5 h-5 w-5 shrink-0 text-gold-light" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5 10 17 19 7.5" /></svg>
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-[14px] text-paper/60">{t("leadNote")}</p>
        </div>
        <div className="rounded-xl bg-paper p-5 text-ink md:p-6">
          <LeadForm calc={answersQuery(input)} phone={phone} />
        </div>
      </section>

      <details className="rounded-2xl border border-line bg-paper px-5 py-4 text-[14px] text-ink-soft md:px-8">
        <summary className="min-h-8 cursor-pointer content-center font-semibold text-ink">{t("sources")}</summary>
        <p className="mt-3">{t("asOf", { date: tr(PRICES_AS_OF), rate: formatNumber(usd.rate), rateDate: usd.date })}</p>
        <p className="mt-2">{t("note")}</p>
        <ul className="mt-3 grid gap-1.5">
          {SOURCES.map((source) => (
            <li key={source.url}><a className="underline decoration-line underline-offset-4 hover:text-ink" href={source.url} target="_blank" rel="noopener noreferrer">{tr(source.label)}</a></li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function StageRow({ stage, total, money, tr, usta }: { stage: Stage; total: number; money: Money; tr: (l: L) => string; usta: string }) {
  const share = total > 0 ? stage.totalUzs / total : 0;
  return (
    <li className="border-t border-line">
      <details className="group">
        <summary className="grid min-h-14 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-5 py-4 hover:bg-cream/50 md:grid-cols-[minmax(0,1fr)_160px_10.5rem] md:px-8 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2.5 font-semibold text-ink">
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
        <ul className="bg-[#fbfaf7] px-5 py-2 md:px-8">
          {stage.lines.map((line) => <LineRow key={line.id} line={line} money={money} tr={tr} usta={usta} />)}
        </ul>
      </details>
    </li>
  );
}

function LineRow({ line, money, tr, usta }: { line: Line; money: Money; tr: (l: L) => string; usta: string }) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 border-t border-dashed border-line py-3 text-[14.5px] first:border-t-0">
      <span className="text-ink">
        {line.kind === "labour" && <span className="mr-2 rounded bg-gold/10 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-gold">{usta}</span>}
        {capitalize(tr(line.label).replace(/^(Usta|Работа): /, ""))}
      </span>
      <span className="text-right font-semibold tabular-nums text-ink">{money.full(line.totalUzs)}</span>
      {line.kind !== "other" && (
        <span className="col-span-2 mt-1 inline-flex items-center gap-1.5 text-[13px] tabular-nums text-ink-soft">
          <Dot source={line.source} />
          {formatNumber(line.qty)} {tr(line.unit)} × {money.unit(line.unitUzs)}
        </span>
      )}
    </li>
  );
}

// ───────────────────────────── Small drawings ─────────────────────────────

function FloorsIcon({ floors }: { floors: Floors }) {
  const full = Math.floor(floors);
  const attic = floors % 1 !== 0;
  const h = 11;
  const top = 52 - full * h;
  return (
    <svg viewBox="0 0 64 60" className="h-16 w-[72px] text-ink" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 52h52" />
      {Array.from({ length: full }, (_, i) => (
        <g key={i}>
          <rect x="14" y={52 - (i + 1) * h} width="36" height={h} />
          <rect x="20" y={52 - (i + 1) * h + 3.5} width="6" height="4.5" />
          <rect x="38" y={52 - (i + 1) * h + 3.5} width="6" height="4.5" />
        </g>
      ))}
      {attic
        ? <><path d={`M10 ${top}L32 ${top - 15}L54 ${top}`} /><rect x="29" y={top - 9} width="6" height="5" /></>
        : <path d={`M10 ${top}L32 ${top - 8}L54 ${top}`} />}
    </svg>
  );
}

function WallIcon({ kind }: { kind: "brick" | "gasblock" }) {
  const brickJoints: [number, number, number[]][] = [[4, 14, [17, 32, 47]], [14, 24, [10, 25, 40, 55]], [24, 34, [17, 32, 47]], [34, 44, [10, 25, 40, 55]]];
  return (
    <svg viewBox="0 0 64 48" className="h-12 w-16 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="2" y="4" width="60" height="40" rx="2" />
      {kind === "brick" ? (
        <>
          {[14, 24, 34].map((y) => <path key={y} d={`M2 ${y}h60`} />)}
          {brickJoints.flatMap(([y1, y2, xs]) => xs.map((x) => <path key={`${y1}-${x}`} d={`M${x} ${y1}V${y2}`} />))}
        </>
      ) : (
        <>
          <path d="M2 24h60" />
          <path d="M26 4v20M50 4v20M14 24v20M38 24v20" />
        </>
      )}
    </svg>
  );
}

function RoofIcon({ kind }: { kind: "pitched" | "flat" }) {
  return (
    <svg viewBox="0 0 64 52" className="h-12 w-16 shrink-0 text-gold" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 48h56" />
      {kind === "pitched" ? (
        <><rect x="14" y="24" width="36" height="24" /><path d="M8 25 32 6l24 19" /><rect x="28" y="34" width="8" height="14" /></>
      ) : (
        <><rect x="12" y="18" width="40" height="30" /><path d="M10 14h44v4H10z" /><rect x="28" y="34" width="8" height="14" /></>
      )}
    </svg>
  );
}

/** Three blocks, filled up to the level: shell · rough · turnkey. */
function LevelBar({ level }: { level: number }) {
  return (
    <span className="flex gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => <span key={i} className={`h-1.5 w-8 rounded-full ${i <= level ? "bg-gold" : "bg-line"}`} />)}
    </span>
  );
}

function Dot({ source }: { source: "market" | "estimate" }) {
  return source === "market"
    ? <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-ink" aria-hidden="true" />
    : <span className="inline-block h-2 w-2 shrink-0 rounded-full border-[1.5px] border-accent" aria-hidden="true" />;
}

// ───────────────────────────── Helpers ─────────────────────────────

const capitalize = (text: string) => text.charAt(0).toLocaleUpperCase() + text.slice(1);

/** The answers as a page address query — for sharing, and sent with a request. */
function answersQuery(input: CostInput): string {
  return new URLSearchParams({
    area: String(input.area), floors: String(input.floors), style: input.style, walls: input.walls,
    roof: input.roof, finish: input.finish, plot: String(input.plotSotix),
    ...(input.basement ? { basement: "1" } : {}), ...(input.fence ? { fence: "1" } : {}), ...(input.paving ? { paving: "1" } : {}),
  }).toString();
}

/**
 * The catalog houses that best fit the visitor's land and answers. A house that
 * needs more land than they have ranks below every one that fits; then the
 * closest in size, the same floors and the same style come first.
 */
function matchPlans(plans: PlanCard[], input: CostInput, limit = 3): PlanCard[] {
  const distance = (plan: PlanCard) =>
    (plan.plotSotix <= input.plotSotix ? 0 : 10 + (plan.plotSotix - input.plotSotix) / input.plotSotix) +
    Math.abs(plan.totalArea - input.area) / input.area +
    (plan.floors === input.floors ? 0 : 0.35) +
    (plan.style === input.style ? 0 : 0.2);
  return [...plans].sort((a, b) => distance(a) - distance(b)).slice(0, limit);
}

function reducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** The total counts up once when the price is revealed; after that it follows the answers directly. */
function useCountUp(value: number) {
  const target = useRef(value);
  const [shown, setShown] = useState<number | null>(0);
  useEffect(() => {
    let frame = 0;
    if (reducedMotion()) {
      frame = requestAnimationFrame(() => setShown(null));
      return () => cancelAnimationFrame(frame);
    }
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1000);
      setShown(p < 1 ? target.current * (1 - Math.pow(1 - p, 3)) : null);
      if (p < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  return shown ?? value;
}

type Money = ReturnType<typeof moneyFormat>;

/** so‘m: "803 mln so‘m" for totals, "1 050 so‘m" for unit prices; dollars: "$66 872", "$0,09". */
function moneyFormat(currency: Currency, rate: number, locale: Locale) {
  const som = locale === "uz" ? "so‘m" : "сум";
  const mln = locale === "uz" ? "mln" : "млн";
  const dollars = (n: number) => (n < 10 ? `$${n.toFixed(2).replace(".", ",")}` : `$${formatNumber(Math.round(n))}`);
  return {
    big: (uzs: number) => currency === "usd" ? dollars(uzs / rate)
      : uzs >= 1e6 ? `${formatNumber(uzs >= 1e8 ? Math.round(uzs / 1e6) : Math.round(uzs / 1e5) / 10)} ${mln} ${som}` : `${formatNumber(Math.round(uzs))} ${som}`,
    full: (uzs: number) => currency === "usd" ? dollars(uzs / rate) : `${formatNumber(Math.round(uzs / 1000) * 1000)} ${som}`,
    unit: (uzs: number) => currency === "usd" ? dollars(uzs / rate) : `${formatNumber(Math.round(uzs))} ${som}`,
  };
}
