import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Shared-password admin login. The session is a signed cookie holding only
 * its expiry time: `<expiresAt>.<HMAC(expiresAt)>`. The password itself is
 * part of the signing key, so changing ADMIN_PASSWORD signs everyone out.
 *
 * Every admin page, server action and route handler calls isAdmin() /
 * requireAdmin() itself — a layout is not an auth boundary.
 */

const COOKIE = "uylar_admin";
const MAX_AGE_S = 60 * 60 * 24 * 14; // 14 days

function signingKey(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const password = process.env.ADMIN_PASSWORD;
  if (!secret || !password) throw new Error("ADMIN_PASSWORD and ADMIN_SESSION_SECRET must be set");
  return `${secret}:${password}`;
}

const sign = (payload: string) => createHmac("sha256", signingKey()).update(payload).digest("base64url");

/** Constant-time comparison (hash first so lengths always match). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHmac("sha256", "compare").update(a).digest();
  const hb = createHmac("sha256", "compare").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function passwordMatches(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(input, expected as string);
}

export async function startAdminSession(): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_S * 1000;
  (await cookies()).set(COOKIE, `${expiresAt}.${sign(String(expiresAt))}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: MAX_AGE_S,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).set(COOKIE, "", { path: "/admin", maxAge: 0 });
}

export async function isAdmin(): Promise<boolean> {
  const value = (await cookies()).get(COOKIE)?.value;
  if (!value) return false;
  const [expiresAt, signature] = value.split(".");
  if (!expiresAt || !signature || !(Number(expiresAt) > Date.now())) return false;
  return safeEqual(signature, sign(expiresAt));
}

/** For pages: send anyone without a valid session to the login screen. */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
