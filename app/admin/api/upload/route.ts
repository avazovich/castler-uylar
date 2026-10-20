import { NextResponse } from "next/server";
import { uploadPhoto } from "@/lib/admin/data";
import { isAdmin } from "@/lib/admin/session";

// The browser shrinks photos to ≤2560px before sending (see PhotoManager),
// so each request stays well under hosting body limits (Vercel: 4.5 MB).
const MAX_BYTES = 4_400_000;
const TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Kirish muddati tugagan" }, { status: 401 });

  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 });
  if (!TYPES.has(file.type)) return NextResponse.json({ error: "Faqat JPG, PNG yoki WEBP rasm" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "Rasm juda katta" }, { status: 413 });

  try {
    return NextResponse.json(await uploadPhoto(file));
  } catch (err) {
    console.error("upload failed", err);
    return NextResponse.json({ error: "Yuklab bo'lmadi. Qayta urinib ko'ring." }, { status: 502 });
  }
}
