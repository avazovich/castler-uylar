import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { formatNumber } from "@/lib/format";
import { getHouse } from "@/lib/houses";
import { notifyTelegram } from "@/lib/telegram";

interface LeadPayload {
  name?: string;
  phone?: string;
  comment?: string;
  houseCode?: number;
  locale?: string;
  /** Honeypot — a hidden field real visitors never fill in. */
  website?: string;
}

// Telegram's HTML mode treats <, >, & as markup.
const escapeHtml = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Best-effort flood guard per server instance: 5 requests / 10 min / IP.
const recent = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > 5;
}

export async function POST(request: Request) {
  let body: LeadPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (body.website) return NextResponse.json({ ok: true });

  const name = (body.name ?? "").trim().slice(0, 80);
  const phoneDigits = (body.phone ?? "").replace(/\D/g, "");
  const comment = (body.comment ?? "").trim().slice(0, 1000);
  if (name.length < 2 || phoneDigits.length < 9 || phoneDigits.length > 15) {
    return NextResponse.json({ ok: false, error: "invalid" }, { status: 400 });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (tooMany(ip)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  const locale = routing.locales.find((l) => l === body.locale) ?? routing.defaultLocale;
  // Look the house up rather than trusting a name/price sent by the browser.
  const house = Number.isInteger(body.houseCode) ? await getHouse(body.houseCode as number, "uz") : undefined;
  const origin = new URL(request.url).origin;
  const e = escapeHtml;
  const time = new Intl.DateTimeFormat("uz-UZ", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Tashkent",
  }).format(new Date());

  const lines = house
    ? [
        "🏠 <b>Yangi so'rov — tayyor loyiha</b>",
        "",
        `📐 Loyiha: № ${house.code}${house.name ? ` · ${e(house.name)}` : ""}`,
        `💰 Narxi: ${formatNumber(house.priceUzs)} so'm${house.isSample ? " (namuna narx)" : ""}`,
        `🔗 ${origin}/${locale}/loyihalar/${house.code}`,
      ]
    : ["✏️ <b>Yangi so'rov — individual loyiha</b>"];

  lines.push(
    "",
    `👤 Ism: ${e(name)}`,
    `📞 Telefon: +${phoneDigits.startsWith("998") ? phoneDigits : `998${phoneDigits}`}`,
  );
  if (comment) lines.push(`💬 Izoh: ${e(comment)}`);
  lines.push(`🌐 Til: ${locale.toUpperCase()}`, `🕐 ${time}`);

  const sent = await notifyTelegram(lines.join("\n"));
  if (!sent) return NextResponse.json({ ok: false, error: "send_failed" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
