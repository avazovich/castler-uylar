import { formatNumber } from "@/lib/format";
import { STYLES } from "@/lib/vocab";
import { computeCost, inputFromParams } from "./engine";

const WALLS = { brick: "Pishgan g‘isht", gasblock: "Gazoblok" };
const ROOF = { pitched: "Qiya tom", flat: "Tekis tom" };
const FINISH = { shell: "Qora karobka", rough: "Qoralama pardoz bilan", turnkey: "Kalit topshirish" };

/**
 * The Leads-group lines for a request sent from the build-cost calculator.
 * The price is worked out again here from the visitor's answers — never taken
 * from the browser — so the team sees exactly what the page showed.
 */
export function calcLeadLines(query: string, origin: string, locale: string, usdRate: number): string[] {
  const params = new URLSearchParams(query.slice(0, 500));
  const input = inputFromParams(params);
  const result = computeCost(input);
  const extras = [input.basement && "yerto‘la", input.fence && "devor va darvoza", input.paving && "hovli yo‘laklari"].filter(Boolean);
  const mln = (uzs: number) => `${formatNumber(uzs >= 1e8 ? Math.round(uzs / 1e6) : Math.round(uzs / 1e5) / 10)} mln so'm`;
  const clean = new URLSearchParams({
    area: String(input.area), floors: String(input.floors), style: input.style, walls: input.walls,
    roof: input.roof, finish: input.finish, plot: String(input.plotSotix),
    ...(input.basement ? { basement: "1" } : {}), ...(input.fence ? { fence: "1" } : {}), ...(input.paving ? { paving: "1" } : {}),
  });
  return [
    "🏗 <b>Yangi so'rov — Castler xizmati</b> (qurilish kalkulyatoridan)",
    "",
    `🏠 ${formatNumber(input.area)} m² · ${formatNumber(input.floors)} qavat · ${STYLES[input.style].uz} · ${WALLS[input.walls]} · ${ROOF[input.roof]}`,
    `📐 Yer: ${formatNumber(input.plotSotix)} sotix`,
    `🧱 ${FINISH[input.finish]}${extras.length ? ` + ${extras.join(", ")}` : ""}`,
    `💰 Hisob: ${mln(result.totalUzs)} ≈ $${formatNumber(Math.round(result.totalUzs / usdRate))} · 1 m² ${mln(result.perM2Uzs)}`,
    `🔗 ${origin}/${locale}/browse/cost?${clean}`,
  ];
}
