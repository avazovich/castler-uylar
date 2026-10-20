import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { Wordmark } from "@/components/Wordmark";
import { isAdmin } from "@/lib/admin/session";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm border-t-4 border-gold bg-paper p-8 shadow-[0_24px_60px_-30px_rgba(26,29,22,0.45)]">
        <Wordmark height={24} />
        <h1 className="font-display mt-6 text-[34px] leading-tight">Admin panel</h1>
        <p className="mt-1 text-sm text-ink-soft">Tayyor uy loyihalari saytini boshqarish</p>
        <LoginForm />
      </div>
    </main>
  );
}
