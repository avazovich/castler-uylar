"use client";

import Image from "next/image";
import { useState } from "react";
import { formatNumber } from "@/lib/format";
import { LEVELS, ROOM_TYPES, type Level, type RoomType } from "@/lib/vocab";
import { newKey, parseNumber, type AdminFloor, type AdminRoom } from "@/lib/admin/types";
import { DecimalInput, Select, TextInput } from "./fields";
import { uploadPhoto } from "./upload";

const LEVEL_OPTIONS = Object.entries(LEVELS).map(([value, l]) => ({ value, label: l.uz }));
const ROOM_OPTIONS = Object.entries(ROOM_TYPES).map(([value, l]) => ({ value, label: l.uz }));
const LEVEL_ORDER: Level[] = ["ground", "second", "third", "basement", "attic", "roof", "yard"];

const emptyRoom = (): AdminRoom => ({ key: newKey(), type: "", customUz: "", customRu: "", area: "" });

export function FloorPlansEditor({
  floors,
  update,
  errors,
}: {
  floors: AdminFloor[];
  update: (fn: (prev: AdminFloor[]) => AdminFloor[]) => void;
  errors: Record<string, string>;
}) {
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const setFloor = (key: string, patch: Partial<AdminFloor>) =>
    update((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  const setRoom = (floorKey: string, roomKey: string, patch: Partial<AdminRoom>) =>
    update((prev) =>
      prev.map((f) =>
        f.key === floorKey ? { ...f, rooms: f.rooms.map((r) => (r.key === roomKey ? { ...r, ...patch } : r)) } : f,
      ),
    );

  function addFloor() {
    update((prev) => {
      const used = new Set(prev.map((f) => f.level));
      const level = LEVEL_ORDER.find((l) => !used.has(l)) ?? "";
      return [...prev, { key: newKey(), level, plan: null, rooms: [emptyRoom(), emptyRoom(), emptyRoom()] }];
    });
  }

  async function uploadPlan(floorKey: string, file: File | undefined) {
    if (!file) return;
    setUploadError(null);
    setUploadingKey(floorKey);
    try {
      const plan = await uploadPhoto(file);
      setFloor(floorKey, { plan });
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploadingKey(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {floors.length === 0 && (
        <p className="text-ink-soft">Hali qavat qo&apos;shilmagan. Har bir qavat uchun xonalar va ularning maydonini kiriting.</p>
      )}

      {floors.map((floor) => {
        const total = floor.rooms.reduce((s, r) => {
          const n = parseNumber(r.area);
          return s + (n && !Number.isNaN(n) ? n : 0);
        }, 0);
        return (
          <div key={floor.key} className="border border-line">
            <div className="flex flex-wrap items-center gap-3 border-b border-line bg-paper-2 px-4 py-3">
              <div className="w-56">
                <Select
                  value={floor.level}
                  onChange={(v) => setFloor(floor.key, { level: v as Level })}
                  options={LEVEL_OPTIONS}
                  placeholder="Qavatni tanlang"
                  error={errors[`floor-${floor.key}`]}
                />
              </div>
              <span className="text-sm text-ink-soft">
                Xonalar jami: <b className="text-ink">{formatNumber(total)} m²</b>
              </span>
              <button
                type="button"
                onClick={() => update((prev) => prev.filter((f) => f.key !== floor.key))}
                className="ml-auto text-sm text-red-700 hover:underline"
              >
                Qavatni o&apos;chirish
              </button>
            </div>
            {errors[`floor-${floor.key}`] && <p className="px-4 pt-3 text-sm text-red-700">{errors[`floor-${floor.key}`]}</p>}

            <div className="grid gap-6 p-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div>
                <div className="hidden grid-cols-[minmax(0,1fr)_130px_40px] gap-2 pb-2 sm:grid">
                  <span className="label-caps text-ink-soft">Xona</span>
                  <span className="label-caps text-ink-soft">Maydon</span>
                </div>
                <div className="flex flex-col gap-2">
                  {floor.rooms.map((room) => (
                    <div key={room.key}>
                      <div className="grid grid-cols-[minmax(0,1fr)_110px_40px] gap-2 sm:grid-cols-[minmax(0,1fr)_130px_40px]">
                        <Select
                          value={room.type}
                          onChange={(v) => setRoom(floor.key, room.key, { type: v as RoomType })}
                          options={ROOM_OPTIONS}
                          placeholder="Xonani tanlang"
                          error={errors[`room-${room.key}`] && !room.type ? errors[`room-${room.key}`] : undefined}
                        />
                        <DecimalInput
                          value={room.area}
                          onChange={(v) => setRoom(floor.key, room.key, { area: v })}
                          suffix="m²"
                          error={errors[`room-${room.key}`]}
                        />
                        <button
                          type="button"
                          onClick={() => setFloor(floor.key, { rooms: floor.rooms.filter((r) => r.key !== room.key) })}
                          className="grid place-items-center border border-line text-ink-soft hover:border-red-700 hover:text-red-700"
                          aria-label="Xonani o'chirish"
                        >
                          ×
                        </button>
                      </div>
                      {room.type === "other" && (
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          <TextInput value={room.customUz} onChange={(v) => setRoom(floor.key, room.key, { customUz: v })} placeholder="Xona nomi (o'zbekcha)" />
                          <TextInput value={room.customRu} onChange={(v) => setRoom(floor.key, room.key, { customRu: v })} placeholder="Название (по-русски)" />
                        </div>
                      )}
                      {errors[`room-${room.key}`] && <p className="mt-1 text-sm text-red-700">{errors[`room-${room.key}`]}</p>}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setFloor(floor.key, { rooms: [...floor.rooms, emptyRoom()] })}
                  className="btn mt-3 border border-line px-4 py-2.5 text-ink hover:border-ink"
                >
                  + Xona qo&apos;shish
                </button>
              </div>

              <div>
                <p className="label-caps mb-2 text-ink-soft">Reja chizmasi (ixtiyoriy)</p>
                {floor.plan ? (
                  <div className="border border-line">
                    <div className="relative aspect-[4/3] bg-paper">
                      <Image src={floor.plan.url} alt="" fill sizes="240px" className="object-contain p-2" />
                    </div>
                    <button type="button" onClick={() => setFloor(floor.key, { plan: null })} className="w-full border-t border-line py-2 text-sm text-red-700 hover:bg-red-50">
                      Chizmani o&apos;chirish
                    </button>
                  </div>
                ) : (
                  <label className="grid aspect-[4/3] cursor-pointer place-items-center border-2 border-dashed border-line text-center text-sm text-ink-soft hover:border-ink">
                    {uploadingKey === floor.key ? "Yuklanmoqda…" : "Chizmani yuklash"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      hidden
                      onChange={(e) => {
                        uploadPlan(floor.key, e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {uploadError && <p className="border-l-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-800">{uploadError}</p>}

      <button type="button" onClick={addFloor} className="btn self-start border border-ink text-ink hover:bg-ink hover:text-paper">
        + Qavat qo&apos;shish
      </button>
    </div>
  );
}
