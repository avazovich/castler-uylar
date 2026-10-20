import { notFound } from "next/navigation";
import { HouseForm } from "@/components/admin/HouseForm";
import { getAdminHouse } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function EditHousePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const house = await getAdminHouse(decodeURIComponent(id));
  if (!house) notFound();
  // key: a fresh form whenever another house is opened.
  return <HouseForm key={house.id} initial={house} />;
}
