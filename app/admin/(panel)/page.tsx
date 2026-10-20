import Link from "next/link";
import { HouseTable } from "@/components/admin/HouseTable";
import { getAdminHouses } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await requireAdmin();
  const houses = await getAdminHouses();
  const samples = houses.filter((h) => h.isSample).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[44px] leading-none">Loyihalar</h1>
          <p className="mt-2 text-ink-soft">
            Jami {houses.length} ta
            {samples > 0 && <> · shundan {samples} tasi namuna (raqamlari hali haqiqiy emas)</>}
          </p>
        </div>
        <Link href="/admin/uylar/yangi" className="btn bg-ink text-paper hover:bg-gold">
          + Yangi loyiha qo&apos;shish
        </Link>
      </div>
      <HouseTable houses={houses} />
    </>
  );
}
