import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "../actions";

// Chrome only — every page under here checks the session itself
// (requireAdmin), since a layout is not an auth boundary.
export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="h-1.5 bg-accent" />
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 px-4 pt-2 md:h-[68px] md:flex-nowrap md:px-8 md:pt-0">
          <Link href="/admin" className="flex items-center gap-2.5 sm:gap-3">
            <Image src="/brand/mark-ink.png" alt="" width={36} height={36} className="h-[30px] w-[30px] sm:h-9 sm:w-9" />
            <span className="font-display text-[17px] tracking-[0.02em] sm:text-[21px]">CASTLER UYLAR</span>
            <span className="hidden rounded bg-accent px-2 py-0.5 text-[11px] font-black uppercase tracking-wider text-[#21150e] sm:inline-block">Admin</span>
          </Link>
          <div className="ml-auto flex items-center gap-2 text-sm md:order-last md:ml-0 md:gap-3">
            <a
              href="/uz"
              target="_blank"
              rel="noopener"
              className="hidden min-h-11 items-center rounded-lg border border-line bg-white px-4 font-bold hover:border-ink sm:inline-flex"
            >
              Saytni ochish ↗
            </a>
            <form action={logout}>
              <button type="submit" className="min-h-11 rounded-lg border border-line bg-white px-4 font-bold hover:border-ink">
                Chiqish
              </button>
            </form>
          </div>
          <AdminNav />
        </div>
      </header>
      <main className="mx-auto max-w-[1200px] px-4 pb-32 pt-8 md:px-8 md:pt-10">{children}</main>
    </>
  );
}
