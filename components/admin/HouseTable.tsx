"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { focusPosition } from "@/lib/focus";
import { formatNumber } from "@/lib/format";
import type { AdminHouseRow } from "@/lib/admin/types";

export function HouseTable({ houses }: { houses: AdminHouseRow[] }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return houses;
    return houses.filter((h) => String(h.code).includes(t) || (h.name ?? "").toLowerCase().includes(t));
  }, [houses, q]);

  if (houses.length === 0) {
    return (
      <div className="mt-8 border border-line bg-paper px-6 py-16 text-center">
        <p className="font-display text-3xl">Hali loyiha yo&apos;q</p>
        <p className="mt-2 text-ink-soft">Birinchi uy loyihasini qo&apos;shing — u darhol saytda paydo bo&apos;ladi.</p>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-line bg-paper">
      <div className="border-b border-line p-4">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Qidirish: raqam yoki nom bo'yicha"
          className="field-input max-w-sm"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-[15px]">
          <thead className="border-b border-line bg-paper-2">
            <tr>
              {["Rasm", "№", "Nomi", "Narx", "Maydon", "Qavat", "Holati", ""].map((h, i) => (
                <th key={i} className="label-caps px-4 py-3 text-ink-soft">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {shown.map((h) => (
              <tr key={h.id} className="border-b border-line last:border-b-0 hover:bg-paper-2/60">
                <td className="px-4 py-3">
                  <div className="relative h-[60px] w-[80px] overflow-hidden bg-paper-2">
                    {h.cover && (
                      <Image
                        src={h.cover.url}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                        style={{ objectPosition: focusPosition(h.cover, 4 / 3) }}
                      />
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-semibold">{h.code}</td>
                <td className="px-4 py-3">{h.name || <span className="text-ink-soft">—</span>}</td>
                <td className="whitespace-nowrap px-4 py-3">{h.priceUzs != null ? `${formatNumber(h.priceUzs)} so'm` : "—"}</td>
                <td className="whitespace-nowrap px-4 py-3">{h.totalArea != null ? `${formatNumber(h.totalArea)} m²` : "—"}</td>
                <td className="px-4 py-3">{h.floors != null ? formatNumber(h.floors) : "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1.5">
                    {h.isSample && <span className="label-caps bg-gold px-2 py-1 text-paper">Namuna</span>}
                    {h.featured && <span className="label-caps bg-ink px-2 py-1 text-paper">Bosh sahifada</span>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right">
                  <a href={`/uz/loyihalar/${h.code}`} target="_blank" rel="noopener" className="mr-4 text-sm text-ink-soft hover:text-ink">
                    Saytda ↗
                  </a>
                  <Link href={`/admin/uylar/${h.id}`} className="btn border border-ink px-4 py-2.5 text-ink hover:bg-ink hover:text-paper">
                    Tahrirlash
                  </Link>
                </td>
              </tr>
            ))}
            {shown.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-ink-soft">
                  Hech narsa topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
