"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { CheckIcon } from "./icons";

/** "901234567" / "+998 90 123…" → "+998 90 123 45 67" as the visitor types. */
function formatUzPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^998/, "").slice(0, 9);
  const parts = [digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean);
  return `+998 ${parts.join(" ")}`.trimEnd();
}

type Status = "idle" | "sending" | "sent" | "error" | "invalid";

export function LeadForm({
  houseCode,
  phone: officePhone,
  tone = "light",
  autoFocus = false,
}: {
  houseCode?: number;
  phone: string;
  tone?: "light" | "dark";
  autoFocus?: boolean;
}) {
  const t = useTranslations("lead");
  const locale = useLocale();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [comment, setComment] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const valid = name.trim().length >= 2 && phone.replace(/\D/g, "").length === 12;
  const dark = tone === "dark";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid) {
      setStatus("invalid");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, comment, houseCode, locale, website }),
      });
      setStatus(res.ok ? "sent" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start gap-3 py-4" role="status">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-gold text-paper">
          <CheckIcon className="h-6 w-6" />
        </span>
        <p className={`font-display text-2xl ${dark ? "text-cream" : "text-ink"}`}>{t("successTitle")}</p>
        <p className={dark ? "text-cream/70" : "text-ink-soft"}>{t("successText")}</p>
        <button
          type="button"
          onClick={() => {
            setStatus("idle");
            setComment("");
          }}
          className={`mt-2 text-sm underline underline-offset-4 ${dark ? "text-cream/70" : "text-ink-soft"}`}
        >
          {t("again")}
        </button>
      </div>
    );
  }

  const labelCls = `mb-1.5 block text-sm ${dark ? "text-cream/70" : "text-ink-soft"}`;

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor={`lead-name-${houseCode ?? "custom"}`} className={labelCls}>
          {t("name")}
        </label>
        <input
          id={`lead-name-${houseCode ?? "custom"}`}
          className="field-input"
          autoComplete="name"
          autoFocus={autoFocus}
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`lead-phone-${houseCode ?? "custom"}`} className={labelCls}>
          {t("phone")}
        </label>
        <input
          id={`lead-phone-${houseCode ?? "custom"}`}
          className="field-input"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(formatUzPhone(e.target.value))}
        />
      </div>
      <div>
        <label htmlFor={`lead-comment-${houseCode ?? "custom"}`} className={labelCls}>
          {t("comment")}
        </label>
        <textarea
          id={`lead-comment-${houseCode ?? "custom"}`}
          className="field-input resize-none"
          rows={2}
          maxLength={1000}
          placeholder={t("commentPlaceholder")}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      {/* Honeypot: hidden from people, filled in by spam bots. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />

      {(status === "invalid" || status === "error") && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {status === "invalid" ? t("invalid") : t("error", { phone: officePhone })}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className={`pill mt-1 w-full ${dark ? "bg-gold text-paper hover:bg-gold-light" : "bg-ink text-paper hover:bg-ink-2"}`}
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>
      <p className={`text-xs ${dark ? "text-cream/50" : "text-ink-soft"}`}>{t("privacy")}</p>
    </form>
  );
}
