"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { calcPath } from "@/lib/browse";
import {
  BLOCK_THICKNESSES, BRICK_THICKNESSES, GRADES, blockWall, brickWall, concrete, houseWalls,
  type BlockThickness, type BrickThickness, type ConcreteGrade, type ConcreteShape, type MaterialKind, type MaterialLine, type MaterialResult, type WallInput,
} from "@/lib/buildCost/materials";
import { PRICES } from "@/lib/buildCost/prices";
import { formatNumber } from "@/lib/format";
import { track } from "@/lib/track";
import { MATERIAL_UI, type MaterialUi } from "@/content/materials";

type Currency = "uzs" | "usd";
const num = (s: string) => {
  const n = Number(s.replace(",", ".").trim());
  return Number.isFinite(n) && n > 0 ? n : 0;
};

/** One labelled number field with its unit. */
function Field({ id, label, unit, value, onChange, step = "any" }: { id: string; label: string; unit: string; value: string; onChange: (v: string) => void; step?: string }) {
  return (
    <label htmlFor={id} className="grid gap-1.5">
      <span className="text-[13.5px] font-semibold text-ink">{label}</span>
      <span className="flex items-center gap-2">
        <input id={id} className="field-input w-full tabular-nums" type="number" inputMode="decimal" min={0} step={step} value={value}
          onChange={(e) => onChange(e.target.value)} />
        <span className="w-8 shrink-0 text-ink-soft">{unit}</span>
      </span>
    </label>
  );
}

/** A row of choices (mode, wall thickness, concrete grade). */
function Choices<T extends string | number>({ label, options, value, onChange, name }: { label: string; options: { id: T; label: string }[]; value: T; onChange: (v: T) => void; name: (id: T) => string }) {
  return (
    <div className="grid gap-1.5" role="group" aria-label={label}>
      <span className="text-[13.5px] font-semibold text-ink">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={name(o.id)} type="button" aria-pressed={value === o.id} onClick={() => onChange(o.id)}
            className={`min-h-11 rounded-lg border px-3.5 text-[14px] font-semibold transition-colors ${value === o.id ? "border-ink bg-ink text-paper" : "border-line bg-paper text-ink hover:border-ink"}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function money(currency: Currency, rate: number, ui: MaterialUi) {
  return (uzs: number) => (currency === "usd" ? `$${formatNumber(Math.round(uzs / rate))}` : `${formatNumber(uzs >= 100_000 ? Math.round(uzs / 1000) * 1000 : Math.round(uzs))} ${ui.som}`);
}

/** The priced lines of a result, with materials, work and the total. */
function Lines({ result, locale, ui, fmt }: { result: MaterialResult; locale: Locale; ui: MaterialUi; fmt: (uzs: number) => string }) {
  const qty = (l: MaterialLine) => {
    const p = PRICES[l.id];
    if (l.id === "rebar") return `${formatNumber(Math.round(l.qty * 1000))} ${ui.kg}`;
    // Russian: 1 мешок, 3 мешка, 147 мешков.
    if (l.id === "cement" && locale === "ru") {
      const n = l.qty % 100;
      const word = n % 10 === 1 && n !== 11 ? "мешок" : n % 10 >= 2 && n % 10 <= 4 && (n < 12 || n > 14) ? "мешка" : "мешков";
      return `${formatNumber(l.qty)} ${word}`;
    }
    return `${formatNumber(l.qty)} ${p.unit[locale]}`;
  };
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left text-[14px]">
        <thead className="text-[12px] uppercase tracking-wider text-paper/60">
          <tr>
            <th scope="col" className="py-2 pr-3 font-semibold">{ui.item}</th>
            <th scope="col" className="py-2 pr-3 text-right font-semibold">{ui.qty}</th>
            <th scope="col" className="py-2 text-right font-semibold">{ui.sum}</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {result.lines.map((l) => (
            <tr key={l.id} className="border-t border-line-on-ink">
              <th scope="row" className="py-2 pr-3 font-normal text-paper/85">{PRICES[l.id].label[locale]}</th>
              <td className="py-2 pr-3 text-right text-paper/85 whitespace-nowrap">{qty(l)}</td>
              <td className="py-2 text-right whitespace-nowrap">{fmt(l.totalUzs)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="tabular-nums">
          <tr className="border-t border-line-on-ink text-paper/70"><th scope="row" className="pt-3 pr-3 font-normal">{ui.materials}</th><td /><td className="pt-3 text-right whitespace-nowrap">{fmt(result.materialsUzs)}</td></tr>
          <tr className="text-paper/70"><th scope="row" className="pr-3 font-normal">{ui.labour}</th><td /><td className="text-right whitespace-nowrap">{fmt(result.labourUzs)}</td></tr>
          <tr className="text-[16px] font-bold"><th scope="row" className="pt-2 pr-3">{ui.total}</th><td /><td className="pt-2 text-right whitespace-nowrap">{fmt(result.totalUzs)}</td></tr>
        </tfoot>
      </table>
    </div>
  );
}

/** Brick, gas-block or concrete calculator: answers update as you type. */
export function MaterialCalculator({ kind, locale, rate, priceDate }: { kind: MaterialKind; locale: Locale; rate: number; priceDate: string }) {
  const ui = MATERIAL_UI[locale];
  const [currency, setCurrency] = useState<Currency>("uzs");
  const fmt = money(currency, rate, ui);

  // Walls
  const [mode, setMode] = useState<"wall" | "house">("house");
  const [wall, setWall] = useState({ length: "10", height: "3", openings: "2" });
  const [house, setHouse] = useState({ width: "10", length: "12", floors: "2", openings: "25" });
  const [brickT, setBrickT] = useState<BrickThickness>(1.5);
  const [blockT, setBlockT] = useState<BlockThickness>(30);
  // Concrete
  const [shape, setShape] = useState<ConcreteShape>("strip");
  const [strip, setStrip] = useState({ length: "44", width: "0.4", depth: "1.2" });
  const [slab, setSlab] = useState({ length: "10", width: "12", depth: "0.2" });
  const [grade, setGrade] = useState<ConcreteGrade>("M250");

  const walls: WallInput = mode === "wall"
    ? { length: num(wall.length), height: num(wall.height), openings: num(wall.openings) }
    : houseWalls(num(house.width), num(house.length), Math.round(num(house.floors)) || 1, num(house.openings));
  const wallResult = useMemo(
    () => (kind === "brick" ? brickWall(walls, brickT) : kind === "block" ? blockWall(walls, blockT) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- walls is rebuilt from these each render
    [kind, mode, wall, house, brickT, blockT],
  );
  const dims = shape === "strip" ? strip : slab;
  const concreteResult = useMemo(
    () => (kind === "concrete" ? concrete({ shape, length: num(dims.length), width: num(dims.width), depth: num(dims.depth), grade }) : null),
    [kind, shape, dims, grade],
  );

  // Statistics: one "calculation" per visit, once someone has changed a number.
  const touched = useRef(false);
  const sent = useRef(false);
  const touch = () => { touched.current = true; };
  const summary = wallResult
    ? `${kind === "brick" ? "G‘isht" : "Gazoblok"}: ${formatNumber(wallResult.area)} m² → ${wallResult.main}`
    : concreteResult ? `Beton ${grade}: ${formatNumber(concreteResult.volume)} m³` : "";
  useEffect(() => {
    if (!touched.current || sent.current) return;
    const id = window.setTimeout(() => { sent.current = true; track("calc", { la: summary }); }, 2500);
    return () => window.clearTimeout(id);
  }, [summary]);

  const currencySwitch = (
    <div className="flex rounded-md border border-line-on-ink p-0.5 text-[13px]" role="group" aria-label={ui.currency}>
      {(["uzs", "usd"] as const).map((c) => (
        <button key={c} type="button" aria-pressed={currency === c} onClick={() => setCurrency(c)}
          className={`min-h-9 rounded px-3 font-semibold transition-colors ${currency === c ? "bg-paper text-ink" : "text-paper/70 hover:text-paper"}`}>
          {c === "uzs" ? ui.som : "USD"}
        </button>
      ))}
    </div>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      {/* The questions */}
      <form className="grid min-w-0 content-start gap-5 rounded-2xl border border-line bg-paper p-5 md:p-7" onSubmit={(e) => e.preventDefault()} onInput={touch} onClick={touch}>
        {kind !== "concrete" ? (
          <>
            <Choices label={ui.what} name={(id) => id} value={mode} onChange={setMode}
              options={[{ id: "house" as const, label: ui.house }, { id: "wall" as const, label: ui.wall }]} />
            {mode === "wall" ? (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field id="m-len" label={ui.length} unit={ui.m} value={wall.length} onChange={(v) => setWall({ ...wall, length: v })} />
                <Field id="m-h" label={ui.height} unit={ui.m} value={wall.height} onChange={(v) => setWall({ ...wall, height: v })} />
                <Field id="m-open" label={ui.openings} unit={ui.m2} value={wall.openings} onChange={(v) => setWall({ ...wall, openings: v })} />
              </div>
            ) : (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field id="m-w" label={ui.houseWidth} unit={ui.m} value={house.width} onChange={(v) => setHouse({ ...house, width: v })} />
                  <Field id="m-l" label={ui.houseLength} unit={ui.m} value={house.length} onChange={(v) => setHouse({ ...house, length: v })} />
                  <Field id="m-f" label={ui.floors} unit="" step="1" value={house.floors} onChange={(v) => setHouse({ ...house, floors: v })} />
                  <Field id="m-o" label={ui.openings} unit={ui.m2} value={house.openings} onChange={(v) => setHouse({ ...house, openings: v })} />
                </div>
                <p className="text-[13px] leading-relaxed text-ink-soft">{ui.houseHint}</p>
              </>
            )}
            {kind === "brick" ? (
              <Choices label={ui.thickness} name={(id) => String(id)} value={brickT} onChange={setBrickT}
                options={BRICK_THICKNESSES.map((t) => ({ id: t, label: ui.brickThickness[t] }))} />
            ) : (
              <Choices label={ui.thickness} name={(id) => String(id)} value={blockT} onChange={setBlockT}
                options={BLOCK_THICKNESSES.map((t) => ({ id: t, label: ui.blockThickness[t] }))} />
            )}
          </>
        ) : (
          <>
            <Choices label={ui.whatConcrete} name={(id) => id} value={shape} onChange={setShape}
              options={[{ id: "strip" as const, label: ui.strip }, { id: "slab" as const, label: ui.slab }]} />
            {shape === "strip" ? (
              <>
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field id="c-len" label={ui.stripLength} unit={ui.m} value={strip.length} onChange={(v) => setStrip({ ...strip, length: v })} />
                  <Field id="c-w" label={ui.trenchWidth} unit={ui.m} value={strip.width} onChange={(v) => setStrip({ ...strip, width: v })} />
                  <Field id="c-d" label={ui.depth} unit={ui.m} value={strip.depth} onChange={(v) => setStrip({ ...strip, depth: v })} />
                </div>
                <p className="text-[13px] leading-relaxed text-ink-soft">{ui.stripHint}</p>
              </>
            ) : (
              <div className="grid gap-4 sm:grid-cols-3">
                <Field id="s-len" label={ui.slabLength} unit={ui.m} value={slab.length} onChange={(v) => setSlab({ ...slab, length: v })} />
                <Field id="s-w" label={ui.slabWidth} unit={ui.m} value={slab.width} onChange={(v) => setSlab({ ...slab, width: v })} />
                <Field id="s-d" label={ui.thicknessM} unit={ui.m} value={slab.depth} onChange={(v) => setSlab({ ...slab, depth: v })} />
              </div>
            )}
            <Choices label={ui.grade} name={(id) => id} value={grade} onChange={setGrade} options={GRADES.map((g) => ({ id: g, label: g }))} />
          </>
        )}
      </form>

      {/* The answer */}
      <section className="min-w-0 rounded-2xl bg-ink p-5 text-paper md:p-7" aria-live="polite">
        {wallResult && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-[44px] leading-none tabular-nums md:text-[56px]">{formatNumber(wallResult.main)}</p>
                <p className="mt-2 text-paper/80">{kind === "brick" ? ui.bricks : ui.blocks} · {ui.breakage}</p>
              </div>
              {currencySwitch}
            </div>
            <p className="mt-4 text-[14px] text-paper/70 tabular-nums">
              {ui.area}: {formatNumber(wallResult.area)} {ui.m2} · {ui.volume}: {formatNumber(wallResult.volume)} {ui.m3}
            </p>
            <div className="mt-5"><Lines result={wallResult} locale={locale} ui={ui} fmt={fmt} /></div>
          </>
        )}
        {concreteResult && (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-display text-[44px] leading-none tabular-nums md:text-[56px]">{formatNumber(concreteResult.volume)}</p>
                <p className="mt-2 text-paper/80">{ui.concreteM3} · {ui.order.replace("{order}", formatNumber(concreteResult.order))}</p>
              </div>
              {currencySwitch}
            </div>
            <div className="mt-5 rounded-xl border border-line-on-ink p-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-paper/60">{ui.perM3} · {grade}</p>
              <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[14px] tabular-nums sm:grid-cols-4">
                <div><dt className="text-paper/60">{ui.cement}</dt><dd>{concreteResult.mix.cementKg} {ui.kg} ({formatNumber(concreteResult.mix.bags)} {ui.bag})</dd></div>
                <div><dt className="text-paper/60">{ui.sand}</dt><dd>{formatNumber(concreteResult.mix.sandM3)} {ui.m3}</dd></div>
                <div><dt className="text-paper/60">{ui.gravel}</dt><dd>{formatNumber(concreteResult.mix.gravelM3)} {ui.m3}</dd></div>
                <div><dt className="text-paper/60">{ui.water}</dt><dd>{concreteResult.mix.waterL} {ui.litre}</dd></div>
              </dl>
              <p className="mt-2 text-[13px] text-paper/60">{ui.ratio}: {concreteResult.mix.ratio}</p>
            </div>
            <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6">
              {concreteResult.ready ? (
                <div><h3 className="mb-1 font-semibold">{ui.ready}</h3><Lines result={concreteResult.ready} locale={locale} ui={ui} fmt={fmt} /></div>
              ) : (
                <p className="text-[14px] text-paper/70">{ui.noReady}</p>
              )}
              <div><h3 className="mb-1 font-semibold">{ui.selfMix}</h3><Lines result={concreteResult.selfMix} locale={locale} ui={ui} fmt={fmt} /></div>
            </div>
            <p className="mt-4 text-[13px] text-paper/60 tabular-nums">
              {ui.rebar.replace("{kg}", formatNumber(concreteResult.rebarKg))} · {ui.water2.replace("{l}", formatNumber(concreteResult.waterL))}
            </p>
          </>
        )}
        <p className="mt-5 text-[12.5px] text-paper/55">{ui.note.replace("{date}", priceDate)}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href={calcPath(locale)} className="btn max-w-full whitespace-normal bg-gold text-center text-white hover:bg-paper hover:text-ink">{ui.houseCalc} →</Link>
          <Link href="/loyihalar" className="btn max-w-full whitespace-normal border border-line-on-ink text-center text-paper hover:bg-paper hover:text-ink">{ui.catalog} →</Link>
        </div>
      </section>
    </div>
  );
}
