"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { buildHouseDocument, isValidId, removeHouse, writeHouse, writeSettings } from "@/lib/admin/data";
import { endAdminSession, isAdmin, passwordMatches, startAdminSession } from "@/lib/admin/session";
import type { AdminHouseInput, AdminSettingsInput, SaveResult } from "@/lib/admin/types";

const SIGNED_OUT: SaveResult = {
  ok: false,
  message: "Kirish muddati tugagan. Sahifani yangilab, parolni qayta kiriting.",
};

// Best-effort brute-force guard per server instance: 10 tries / 15 min / IP.
const attempts = new Map<string, number[]>();

export async function login(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < 15 * 60_000);
  if (recent.length >= 10) return { error: "Juda ko'p urinish. 15 daqiqadan so'ng qayta urinib ko'ring." };

  if (!passwordMatches(String(formData.get("password") ?? ""))) {
    attempts.set(ip, [...recent, now]);
    return { error: "Parol noto'g'ri" };
  }
  attempts.delete(ip);
  await startAdminSession();
  redirect("/admin");
}

export async function logout(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login");
}

export async function saveHouse(input: AdminHouseInput): Promise<SaveResult> {
  if (!(await isAdmin())) return SIGNED_OUT;
  const built = await buildHouseDocument(input);
  if ("errors" in built) {
    return { ok: false, message: "Saqlanmadi — qizil bilan belgilangan joylarni tuzating.", errors: built.errors };
  }
  try {
    await writeHouse(built.doc);
  } catch (err) {
    console.error("saveHouse failed", err);
    return { ok: false, message: "Saqlab bo'lmadi (internet yoki server xatosi). Qayta urinib ko'ring." };
  }
  // The public site caches pages for up to a minute — refresh them now.
  revalidatePath("/", "layout");
  return { ok: true, id: built.doc._id as string, code: built.doc.code as number };
}

export async function deleteHouse(id: string): Promise<SaveResult> {
  if (!(await isAdmin())) return SIGNED_OUT;
  if (!isValidId(id)) return { ok: false, message: "Noto'g'ri loyiha" };
  try {
    await removeHouse(id);
  } catch (err) {
    console.error("deleteHouse failed", err);
    return { ok: false, message: "O'chirib bo'lmadi. Qayta urinib ko'ring." };
  }
  revalidatePath("/", "layout");
  return { ok: true, id };
}

export async function saveSettings(input: AdminSettingsInput): Promise<SaveResult> {
  if (!(await isAdmin())) return SIGNED_OUT;
  try {
    const result = await writeSettings(input);
    if (result.ok) revalidatePath("/", "layout");
    return result;
  } catch (err) {
    console.error("saveSettings failed", err);
    return { ok: false, message: "Saqlab bo'lmadi. Qayta urinib ko'ring." };
  }
}
