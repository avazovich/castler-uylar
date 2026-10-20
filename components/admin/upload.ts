"use client";

import type { AdminPhoto } from "@/lib/admin/types";

const MAX_SIDE = 2560;
const KEEP_AS_IS_BYTES = 3_000_000;

/**
 * Shrinks a photo in the browser (longest side ≤ 2560px, JPEG) before upload:
 * plenty for the web, and keeps every request under hosting body limits.
 * Small enough files are sent untouched.
 */
async function prepare(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= KEEP_AS_IS_BYTES && file.type !== "image/png") {
    bitmap.close();
    return file;
  }
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/jpeg", 0.88),
  );
  return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
}

export async function uploadPhoto(file: File): Promise<AdminPhoto> {
  if (!file.type.startsWith("image/")) throw new Error("Bu rasm emas");
  const prepared = await prepare(file);
  const body = new FormData();
  body.append("file", prepared);
  const res = await fetch("/admin/api/upload", { method: "POST", body });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Yuklab bo'lmadi");
  return data as AdminPhoto;
}
