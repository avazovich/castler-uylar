"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { focusPosition } from "@/lib/focus";
import type { AdminPhoto } from "@/lib/admin/types";
import { FocusPicker } from "./FocusPicker";
import { uploadPhoto } from "./upload";

/** Upload, order, pick the cover and set each photo's centre. Photo 1 = cover. */
export function PhotoManager({
  photos,
  update,
  error,
}: {
  photos: AdminPhoto[];
  /** Functional update, so uploads finishing one by one never drop each other. */
  update: (fn: (prev: AdminPhoto[]) => AdminPhoto[]) => void;
  error?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [failures, setFailures] = useState<string[]>([]);
  const [editing, setEditing] = useState<string | null>(null);

  async function add(files: FileList | null) {
    if (!files?.length) return;
    setFailures([]);
    setUploading((n) => n + files.length);
    for (const file of Array.from(files)) {
      try {
        const photo = await uploadPhoto(file);
        update((prev) => [...prev, photo]);
      } catch (err) {
        setFailures((f) => [...f, `${file.name}: ${(err as Error).message}`]);
      } finally {
        setUploading((n) => n - 1);
      }
    }
  }

  const move = (i: number, to: number) =>
    update((prev) => {
      const next = [...prev];
      const [p] = next.splice(i, 1);
      next.splice(to, 0, p);
      return next;
    });

  const editingPhoto = photos.find((p) => p.key === editing);

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((p, i) => (
          <figure key={p.key} className={`border ${i === 0 ? "border-ink" : "border-line"} bg-paper`}>
            <button
              type="button"
              onClick={() => setEditing(p.key)}
              className="group relative block aspect-[4/3] w-full overflow-hidden bg-paper-2"
              title="Rasm markazini belgilash"
            >
              <Image
                src={p.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 360px, 50vw"
                className="object-cover"
                style={{ objectPosition: focusPosition(p, 4 / 3) }}
              />
              {i === 0 && <span className="label-caps absolute left-0 top-0 bg-ink px-3 py-2 text-paper">Asosiy rasm</span>}
              <span className="label-caps absolute inset-x-0 bottom-0 bg-ink/75 px-3 py-2 text-left text-paper opacity-0 transition group-hover:opacity-100">
                Markazini belgilash
              </span>
            </button>
            <figcaption className="flex items-center gap-1 border-t border-line p-2 text-sm">
              <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)} className="px-2 py-1 hover:bg-paper-2 disabled:opacity-30" aria-label="Chapga">
                ←
              </button>
              <button
                type="button"
                disabled={i === photos.length - 1}
                onClick={() => move(i, i + 1)}
                className="px-2 py-1 hover:bg-paper-2 disabled:opacity-30"
                aria-label="O'ngga"
              >
                →
              </button>
              {i > 0 && (
                <button type="button" onClick={() => move(i, 0)} className="px-2 py-1 hover:bg-paper-2">
                  Asosiy qilish
                </button>
              )}
              <button
                type="button"
                onClick={() => update((prev) => prev.filter((x) => x.key !== p.key))}
                className="ml-auto px-2 py-1 text-red-700 hover:bg-red-50"
              >
                O&apos;chirish
              </button>
            </figcaption>
          </figure>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className="grid aspect-[4/3] place-items-center border border-dashed border-line bg-paper-2 text-sm text-ink-soft">
            Yuklanmoqda…
          </div>
        ))}

        <button
          type="button"
          onClick={() => input.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            add(e.dataTransfer.files);
          }}
          className={`grid aspect-[4/3] place-items-center border-2 border-dashed ${error ? "border-red-700" : "border-line"} bg-paper text-center hover:border-ink`}
        >
          <span>
            <span className="font-display block text-[40px] leading-none">+</span>
            <span className="mt-2 block font-medium">Rasm qo&apos;shish</span>
            <span className="mt-1 block text-xs text-ink-soft">Bosing yoki rasmlarni shu yerga tashlang</span>
          </span>
        </button>
      </div>

      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        hidden
        onChange={(e) => {
          add(e.target.files);
          e.target.value = "";
        }}
      />

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {failures.map((f) => (
        <p key={f} className="mt-2 border-l-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-800">
          {f}
        </p>
      ))}
      <p className="mt-4 text-sm text-ink-soft">
        Birinchi rasm katalogda ko&apos;rinadi. Har bir rasmni bosib, uyning o&apos;rtasini belgilang — sayt rasmni shu nuqta atrofida
        kesadi.
      </p>

      {editingPhoto && (
        <FocusPicker
          photo={editingPhoto}
          isCover={photos[0]?.key === editingPhoto.key}
          onClose={() => setEditing(null)}
          onSave={(focus) => {
            update((prev) => prev.map((p) => (p.key === editingPhoto.key ? { ...p, focus } : p)));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
