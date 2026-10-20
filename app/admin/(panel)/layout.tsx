import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { Wordmark } from "@/components/Wordmark";
import { logout } from "../actions";

// Chrome only — every page under here checks the session itself
// (requireAdmin), since a layout is not an auth boundary.
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 bg-ink text-cream">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 px-4 pt-3 md:h-16 md:flex-nowrap md:px-8 md:pt-0">
          <Link href="/admin" className="flex items-center gap-3">
            <Wordmark variant="cream" height={20} />
            <span className="label-caps text-gold-light">Admin</span>
          </Link>
          <AdminNav />
          <div className="ml-auto flex items-center gap-5 text-sm">
            <a href="/uz" target="_blank" rel="noopener" className="hidden text-cream/70 hover:text-cream sm:inline">
              Saytni ochish ↗
            </a>
            <form action={logout}>
              <button type="submit" className="label-caps border border-line-on-ink px-3 py-2 text-cream/80 hover:border-cream hover:text-cream">
                Chiqish
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-4 pb-32 pt-8 md:px-8 md:pt-10">{children}</main>
    </>
  );
}
