"use client";

import { useState, useTransition } from "react";
import { saveSettings } from "@/app/admin/actions";
import type { AdminSettingsInput } from "@/lib/admin/types";
import { Field, Section, TextArea, TextInput } from "./fields";

export function SettingsForm({ initial }: { initial: AdminSettingsInput }) {
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const set = (key: keyof AdminSettingsInput, value: string) => setForm((f) => ({ ...f, [key]: value }));

  function save() {
    setNotice(null);
    startTransition(async () => {
      const result = await saveSettings(form);
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setNotice({ tone: "error", text: result.message });
        return;
      }
      setErrors({});
      setSaved(form);
      setNotice({ tone: "ok", text: "Saqlandi. Saytda bir necha soniyada yangilanadi." });
    });
  }

  return (
    <div>
      <h1 className="font-display text-[44px] leading-none">Sozlamalar</h1>
      <p className="mt-2 text-ink-soft">Saytning barcha sahifalarida ko&apos;rinadigan aloqa ma&apos;lumotlari.</p>

      <div className="mt-8 flex flex-col gap-6">
        <Section title="Aloqa">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Telefon raqami" hint="Masalan: +998 77 000 16 00" error={errors.phone}>
              <TextInput value={form.phone} onChange={(v) => set("phone", v)} inputMode="tel" error={errors.phone} />
            </Field>
            <Field label="Telegram" hint="@ belgisisiz, masalan: castler_uz. Bo'sh qolsa, tugma ko'rinmaydi." error={errors.telegram}>
              <TextInput value={form.telegram} onChange={(v) => set("telegram", v)} error={errors.telegram} />
            </Field>
            <Field label="Instagram havolasi" hint="https://www.instagram.com/..." error={errors.instagram}>
              <TextInput value={form.instagram} onChange={(v) => set("instagram", v)} error={errors.instagram} />
            </Field>
            <Field label="Manzil (o'zbekcha)" hint="Ixtiyoriy">
              <TextInput value={form.addressUz} onChange={(v) => set("addressUz", v)} />
            </Field>
            <Field label="Manzil (ruscha)" hint="Ixtiyoriy">
              <TextInput value={form.addressRu} onChange={(v) => set("addressRu", v)} />
            </Field>
          </div>
        </Section>

        <Section
          title="Har bir loyihaga nimalar kiradi"
          hint="Har bir qatorga bitta band. Bosh sahifada va har bir uy sahifasida ko'rinadi. Bo'sh qolsa, bo'lim ko'rinmaydi."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="O'zbekcha">
              <TextArea value={form.includedUz} onChange={(v) => set("includedUz", v)} rows={8} />
            </Field>
            <Field label="Ruscha">
              <TextArea value={form.includedRu} onChange={(v) => set("includedRu", v)} rows={8} />
            </Field>
          </div>
        </Section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-4 py-3 md:px-8">
          <p className={`text-sm ${notice?.tone === "error" ? "text-red-700" : notice ? "text-green-800" : "text-ink-soft"}`} role="status">
            {notice?.text ?? (dirty ? "Saqlanmagan o'zgarishlar bor" : "Hammasi saqlangan")}
          </p>
          <button type="button" onClick={save} disabled={pending} className="btn ml-auto bg-ink text-paper hover:bg-gold">
            {pending ? "Saqlanmoqda…" : "Saqlash"}
          </button>
        </div>
      </div>
    </div>
  );
}
