"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { flush, startFlushing, track, trackingEnabled } from "@/lib/track";

/** Longest stretch one page can count in one go — a tab left open overnight isn't reading. */
const MAX_SEGMENT_MS = 30 * 60_000;

/** "Zamonaviy uslubdagi dacha" from a house card: the heading inside, else the first line of text. */
function labelOf(el: HTMLElement): string {
  const own = el.dataset.track || el.getAttribute("aria-label") || el.getAttribute("title");
  if (own) return own.trim().slice(0, 80);
  // The text as written, not innerText: the site writes some buttons in capitals with CSS only.
  const source = el.querySelector<HTMLElement>("h1, h2, h3, h4") ?? el;
  const parts: string[] = [];
  const walker = document.createTreeWalker(source, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.textContent?.trim()) parts.push(n.textContent.trim());
  return parts.join(" ").replace(/\s+/g, " ").slice(0, 80);
}

/** Where a click leads: a page of ours, a phone number, Telegram, another site, or the request form. */
function targetOf(el: HTMLElement): string {
  if (el.dataset.contact) return `contact:${el.dataset.contact}`;
  const href = el instanceof HTMLAnchorElement ? el.getAttribute("href") : null;
  if (!href) return "";
  if (/^(tel|mailto|sms):/i.test(href)) return href.replace(/\s+/g, "");
  try {
    const url = new URL(href, window.location.href);
    if (url.origin === window.location.origin) return url.pathname + (url.hash || "");
    return (url.hostname.replace(/^www\./, "") + url.pathname).replace(/\/$/, "").slice(0, 200);
  } catch {
    return href.slice(0, 200);
  }
}

/**
 * Counts what visitors do, for the «Sayt» page in the Castler app (see lib/track.ts):
 * a view per page, the time each page is on screen and how far it was scrolled,
 * and every link or button pressed.
 */
export function Track() {
  const pathname = usePathname();
  const page = useRef<{ path: string; visibleSince: number | null; ms: number; scroll: number } | null>(null);

  // Time on screen and scroll depth of the page being read.
  useEffect(() => {
    if (!trackingEnabled()) return;
    startFlushing();
    const scrolled = () => {
      const p = page.current;
      if (!p) return;
      const doc = document.documentElement;
      const depth = Math.round(((window.scrollY + window.innerHeight) / Math.max(1, doc.scrollHeight)) * 100);
      p.scroll = Math.min(100, Math.max(p.scroll, depth));
    };
    const hidden = () => {
      const p = page.current;
      if (p?.visibleSince != null) {
        p.ms += Math.min(MAX_SEGMENT_MS, Date.now() - p.visibleSince);
        p.visibleSince = null;
      }
      if (p && p.ms > 0) {
        track("leave", { p: p.path, ms: p.ms, sc: p.scroll });
        p.ms = 0;
      }
      flush();
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") hidden();
      else if (page.current) page.current.visibleSince = Date.now();
    };
    const clicked = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("a, button, summary, [role='button'], [data-track]");
      if (!el || el.closest("[data-notrack]")) return;
      const label = labelOf(el);
      const target = targetOf(el);
      if (!label && !target) return;
      track("click", { la: label, to: target });
      // Leaving the site (a phone call, Telegram): send it now.
      if (/^(tel|mailto|sms):/i.test(target) || (target && !target.startsWith("/") && !target.startsWith("contact:"))) flush();
    };
    window.addEventListener("scroll", scrolled, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", hidden);
    document.addEventListener("click", clicked, { capture: true });
    return () => {
      window.removeEventListener("scroll", scrolled);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", hidden);
      document.removeEventListener("click", clicked, { capture: true });
    };
  }, []);

  // A view for each page, and a "leave" for the one before it.
  useEffect(() => {
    if (!trackingEnabled()) return;
    const before = page.current;
    if (before && before.path !== pathname) {
      const ms = before.ms + (before.visibleSince != null ? Math.min(MAX_SEGMENT_MS, Date.now() - before.visibleSince) : 0);
      if (ms > 0) track("leave", { p: before.path, ms, sc: before.scroll });
    }
    page.current = { path: pathname, visibleSince: document.visibilityState === "visible" ? Date.now() : null, ms: 0, scroll: 0 };
    // The new page's title is set a moment after the address changes.
    const id = window.setTimeout(() => {
      track("view", { p: pathname, ti: document.title.slice(0, 200) });
      const doc = document.documentElement;
      if (page.current?.path === pathname) page.current.scroll = Math.min(100, Math.round((window.innerHeight / Math.max(1, doc.scrollHeight)) * 100));
    }, 350);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}
