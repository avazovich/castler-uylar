import { HouseForm } from "@/components/admin/HouseForm";
import { nextFreeCode } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";
import { newKey, type AdminHouseInput } from "@/lib/admin/types";

export const dynamic = "force-dynamic";

export default async function NewHousePage() {
  await requireAdmin();
  const code = await nextFreeCode();
  const room = () => ({ key: newKey(), type: "" as const, customUz: "", customRu: "", area: "" });
  const initial: AdminHouseInput = {
    code: String(code),
    nameUz: "",
    nameRu: "",
    isSample: false,
    featured: false,
    style: "",
    floors: "",
    priceUzs: "",
    oldPriceUzs: "",
    plotSotix: "",
    minPlotWidth: "",
    minPlotLength: "",
    totalArea: "",
    descriptionUz: "",
    descriptionRu: "",
    photos: [],
    floorPlans: [{ key: newKey(), level: "ground", plan: null, rooms: [room(), room(), room()] }],
    costs: [],
  };
  return <HouseForm initial={initial} />;
}
