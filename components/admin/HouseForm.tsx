"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { deleteHouse, saveHouse } from "@/app/admin/actions";
import { STYLES } from "@/lib/vocab";
import { FLOOR_CHOICES, type AdminHouseInput } from "@/lib/admin/types";
import { CostsEditor } from "./CostsEditor";
import { Checkbox, DecimalInput, Field, PriceInput, Section, Select, TextArea, TextInput } from "./fields";
import { FloorPlansEditor } from "./FloorPlansEditor";
import { PhotoManager } from "./PhotoManager";

const STYLE_OPTIONS = Object.entries(STYLES).map(([value, l]) => ({ value, label: l.uz }));
const FLOOR_OPTIONS = FLOOR_CHOICES.map((v) => ({ value: v, label: v }));

export function HouseForm({ initial }: { initial: AdminHouseInput }) {
  const router = useRouter();
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const isNew = !form.id;
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof AdminHouseInput>(key: K, value: AdminHouseInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function save() {
    setNotice(null);
    startTransition(async () => {
      const result = await saveHouse(form);
      if (!result.ok) {
        setErrors(result.errors ?? {});
        setNotice({ tone: "error", text: result.message });
        // Bring the first problem into view.
        requestAnimationFrame(() => document.querySelector('[role="alert"], .border-red-700')?.scrollIntoView({ block: "center", behavior: "smooth" }));
        return;
      }
      const next = { ...form, id: result.id };
      setErrors({});
      setForm(next);
      setSaved(next);
      setNotice({ tone: "ok", text: "Saqlandi. Saytda bir necha soniyada yangilanadi." });
      if (isNew) router.replace(`/admin/uylar/${result.id}`);
    });
  }

  function remove() {
    if (!form.id) return;
    if (!window.confirm(`№ ${form.code} loyihani butunlay o'chirasizmi? Bu saytdan ham o'chadi.`)) return;
    startTransition(async () => {
      const result = await deleteHouse(form.id as string);
      if (!result.ok) {
        setNotice({ tone: "error", text: result.message });
        return;
      }
      setSaved(form); // nothing left to warn about
      router.push("/admin");
      router.refresh();
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm text-ink-soft hover:text-ink">
            ← Loyihalar ro&apos;yxati
          </Link>
          <h1 className="font-display mt-2 text-[44px] leading-none">
            {isNew ? "Yangi loyiha" : `№ ${saved.code}${saved.nameUz ? ` · ${saved.nameUz}` : ""}`}
          </h1>
        </div>
        {!isNew && (
          <a href={`/uz/loyihalar/${saved.code}`} target="_blank" rel="noopener" className="btn border border-ink text-ink hover:bg-ink hover:text-paper">
            Saytda ko&apos;rish ↗
          </a>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-6">
        <Section title="Asosiy ma'lumotlar">
          <div className="grid gap-5 md:grid-cols-3">
            <Field label="Katalog raqami" hint="Saytda “№ 111” bo'lib ko'rinadi" error={errors.code}>
              <TextInput value={form.code} onChange={(v) => set("code", v.replace(/\D/g, ""))} inputMode="numeric" error={errors.code} />
            </Field>
            <Field label="Nomi (o'zbekcha)" hint="Ixtiyoriy, masalan: Afsona">
              <TextInput value={form.nameUz} onChange={(v) => set("nameUz", v)} />
            </Field>
            <Field label="Nomi (ruscha)" hint="Bo'sh qolsa, o'zbekcha nomi ko'rinadi">
              <TextInput value={form.nameRu} onChange={(v) => set("nameRu", v)} />
            </Field>
            <Field label="Uslub">
              <Select value={form.style} onChange={(v) => set("style", v as AdminHouseInput["style"])} options={STYLE_OPTIONS} placeholder="Tanlanmagan" />
            </Field>
            <Field label="Qavatlar soni" error={errors.floors}>
              <Select value={form.floors} onChange={(v) => set("floors", v)} options={FLOOR_OPTIONS} placeholder="Tanlang" error={errors.floors} />
            </Field>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <Checkbox
              checked={form.featured}
              onChange={(v) => set("featured", v)}
              label="Bosh sahifada ko'rsatish"
              hint="Bosh sahifadagi “Tanlangan loyihalar” qatoriga chiqadi"
            />
            <Checkbox
              checked={form.isSample}
              onChange={(v) => set("isSample", v)}
              label="Namuna (raqamlar hali haqiqiy emas)"
              hint="Belgilansa, saytda “Namuna” belgisi chiqadi. Haqiqiy narx va o'lchamlarni kiritgach, belgini olib tashlang."
            />
          </div>
        </Section>

        <Section title="Narx">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Narx" hint="Loyiha hujjatlari narxi, so'mda" error={errors.priceUzs}>
              <PriceInput value={form.priceUzs} onChange={(v) => set("priceUzs", v)} suffix="so'm" error={errors.priceUzs} />
            </Field>
            <Field label="Eski narx (ixtiyoriy)" hint="Ustidan chizilgan holda ko'rinadi. Chegirma bo'lmasa, bo'sh qoldiring." error={errors.oldPriceUzs}>
              <PriceInput value={form.oldPriceUzs} onChange={(v) => set("oldPriceUzs", v)} suffix="so'm" error={errors.oldPriceUzs} />
            </Field>
          </div>
        </Section>

        <Section title="O'lchamlar" hint="Kasr sonlarni vergul bilan yozing, masalan: 5,4">
          <div className="grid gap-5 md:grid-cols-4">
            <Field label="Yer maydoni" hint="Uy sig'adigan eng kichik yer" error={errors.plotSotix}>
              <DecimalInput value={form.plotSotix} onChange={(v) => set("plotSotix", v)} suffix="sotix" error={errors.plotSotix} />
            </Field>
            <Field label="Umumiy maydon" error={errors.totalArea}>
              <DecimalInput value={form.totalArea} onChange={(v) => set("totalArea", v)} suffix="m²" error={errors.totalArea} />
            </Field>
            <Field label="Yer eni (kamida)" hint="“Yer eni” filtri shunga qaraydi" error={errors.minPlotWidth}>
              <DecimalInput value={form.minPlotWidth} onChange={(v) => set("minPlotWidth", v)} suffix="m" error={errors.minPlotWidth} />
            </Field>
            <Field label="Yer bo'yi (kamida)" hint="Ixtiyoriy" error={errors.minPlotLength}>
              <DecimalInput value={form.minPlotLength} onChange={(v) => set("minPlotLength", v)} suffix="m" error={errors.minPlotLength} />
            </Field>
          </div>
        </Section>

        <Section title="Rasmlar" id="photos">
          <PhotoManager photos={form.photos} update={(fn) => setForm((f) => ({ ...f, photos: fn(f.photos) }))} error={errors.photos} />
        </Section>

        <Section title="Tavsif" hint="Ixtiyoriy. 1–3 gap uy haqida.">
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="O'zbekcha">
              <TextArea value={form.descriptionUz} onChange={(v) => set("descriptionUz", v)} />
            </Field>
            <Field label="Ruscha">
              <TextArea value={form.descriptionRu} onChange={(v) => set("descriptionRu", v)} />
            </Field>
          </div>
        </Section>

        <Section title="Qavatlar rejasi" hint="Xona nomlari ruschaga avtomatik tarjima qilinadi. Yotoqxona va sanuzellar soni shu ro'yxatdan hisoblanadi.">
          <FloorPlansEditor floors={form.floorPlans} update={(fn) => setForm((f) => ({ ...f, floorPlans: fn(f.floorPlans) }))} errors={errors} />
        </Section>

        <Section title="Qurilish xarajatlari" hint="Karkas uchun taxminiy hisob, AQSh dollarida. Ixtiyoriy.">
          <CostsEditor costs={form.costs} update={(fn) => setForm((f) => ({ ...f, costs: fn(f.costs) }))} errors={errors} />
        </Section>

        {!isNew && (
          <div className="border border-red-200 bg-paper p-5">
            <p className="font-medium">Loyihani o&apos;chirish</p>
            <p className="mt-1 text-sm text-ink-soft">Loyiha saytdan va bazadan butunlay o&apos;chiriladi.</p>
            <button type="button" onClick={remove} disabled={pending} className="btn mt-4 border border-red-700 text-red-700 hover:bg-red-700 hover:text-paper">
              O&apos;chirish
            </button>
          </div>
        )}
      </div>

      {/* Sticky save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-4 px-4 py-3 md:px-8">
          <p className={`text-sm ${notice?.tone === "error" ? "text-red-700" : notice ? "text-green-800" : "text-ink-soft"}`} role="status">
            {notice?.text ?? (dirty ? "Saqlanmagan o'zgarishlar bor" : "Hammasi saqlangan")}
          </p>
          <div className="ml-auto flex gap-3">
            <Link href="/admin" className="btn border border-line text-ink hover:border-ink">
              Bekor qilish
            </Link>
            <button type="button" onClick={save} disabled={pending} className="btn bg-ink text-paper hover:bg-gold">
              {pending ? "Saqlanmoqda…" : "Saqlash"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
