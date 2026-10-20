import { SettingsForm } from "@/components/admin/SettingsForm";
import { getAdminSettings } from "@/lib/admin/data";
import { requireAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();
  return <SettingsForm initial={await getAdminSettings()} />;
}
