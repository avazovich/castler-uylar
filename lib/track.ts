/**
 * Visitor statistics for the «Sayt» page in the Castler app: which pages
 * people open, how long each stays on screen, how far down they scroll, what
 * they click, and when they finish the calculator or send a request.
 *
 * Anonymous: a random id kept in the visitor's browser — no names, no phone
 * numbers, no cookies. Events are collected and sent together every few
 * seconds and when the tab is hidden or closed. Nothing is sent from a copy of
 * the site on a developer's computer unless NEXT_PUBLIC_STATS_URL says where,
 * or from a browser opened once with ?notrack=1 (the team's own phones).
 */

const ENDPOINT = process.env.NEXT_PUBLIC_STATS_URL || "https://internal.castler.uz/api/sayt/e";
const LIVE_HOST = "uylar.castler.uz";
const SESSION_GAP_MS = 30 * 60_000;
const FLUSH_MS = 5_000;
const MAX_BATCH = 40;

type Event = Record<string, string | number>;

const queue: Event[] = [];
/** Who the queued events belong to. */
let ids: { v: string; s: string } | null = null;
const memory = new Map<string, string>();

function store(key: string, value?: string): string | null {
  try {
    if (value !== undefined) localStorage.setItem(key, value);
    return localStorage.getItem(key);
  } catch {
    if (value !== undefined) memory.set(key, value);
    return memory.get(key) ?? null;
  }
}

const randomId = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`).replace(/[^a-zA-Z0-9]/g, "").slice(0, 20);

/** Off on a developer's computer, in automated browsers, and on phones the team switched off with ?notrack=1. */
export function trackingEnabled(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search).get("notrack");
  if (q === "1") store("castler.notrack", "1");
  if (q === "0") store("castler.notrack", "0");
  if (store("castler.notrack") === "1") return false;
  if (navigator.webdriver) return false;
  return window.location.hostname === LIVE_HOST || Boolean(process.env.NEXT_PUBLIC_STATS_URL);
}

/**
 * The visitor's id, and this visit's. Only a page view starts a new visit
 * (after 30 minutes without activity), so the time and clicks of a page always
 * belong to the visit it was opened in. `fresh`: this is the visit's first page view.
 */
function current(isView: boolean): { v: string; s: string; fresh: boolean } {
  const now = Date.now();
  const v = store("castler.v") ?? store("castler.v", randomId()) ?? randomId();
  const last = Number(store("castler.s.last") ?? 0);
  let s = store("castler.s");
  if (!s || (isView && now - last > SESSION_GAP_MS)) {
    s = store("castler.s", randomId()) ?? randomId();
    // Remembered until the visit's first page view is sent, even across a reload.
    store("castler.s.first", "1");
  }
  store("castler.s.last", String(now));
  const fresh = isView && store("castler.s.first") === "1";
  if (fresh) store("castler.s.first", "0");
  return { v, s, fresh };
}

/** Phone, tablet or computer, from the screen. */
export function deviceKind(): "mobile" | "tablet" | "desktop" {
  const w = window.innerWidth;
  const touch = window.matchMedia?.("(pointer: coarse)").matches;
  if (w < 640) return "mobile";
  if (w < 1100 && touch) return "tablet";
  return "desktop";
}

const lang = () => (window.location.pathname.split("/")[1] === "ru" ? "ru" : "uz");

/** Note one event; it is sent with the next batch. */
export function track(type: "view" | "leave" | "click" | "calc" | "lead", data: Event = {}) {
  if (!trackingEnabled()) return;
  const { v, s, fresh } = current(type === "view");
  // A new visit: send the old one's events under the old id first.
  if (ids && ids.s !== s) flush();
  ids = { v, s };
  const event: Event = { t: type, p: window.location.pathname, d: deviceKind(), l: lang(), ...data };
  // The first page of a new visit says where the visitor came from.
  if (fresh) {
    event.f = 1;
    event.r = document.referrer;
    event.q = window.location.search;
  }
  queue.push(event);
  if (queue.length >= MAX_BATCH) flush();
}

/** Send what has been collected. */
export function flush() {
  if (!queue.length || !ids) return;
  const batch = queue.splice(0, MAX_BATCH);
  const body = JSON.stringify({ v: ids.v, s: ids.s, e: batch });
  const blob = new Blob([body], { type: "text/plain" });
  let sent = false;
  try {
    sent = navigator.sendBeacon?.(ENDPOINT, blob) ?? false;
  } catch {
    sent = false;
  }
  if (!sent) {
    fetch(ENDPOINT, { method: "POST", body, mode: "no-cors", keepalive: true, headers: { "content-type": "text/plain" } }).catch(() => {});
  }
  if (queue.length) flush();
}

let timer: number | undefined;
export function startFlushing() {
  window.clearInterval(timer);
  timer = window.setInterval(flush, FLUSH_MS);
}
