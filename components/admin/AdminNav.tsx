"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav() {
  const pathname = usePathname();
  const items = [
    { href: "/admin", label: "Loyihalar", active: pathname === "/admin" || pathname.startsWith("/admin/uylar") },
    { href: "/admin/sozlamalar", label: "Sozlamalar", active: pathname.startsWith("/admin/sozlamalar") },
  ];
  return (
    <nav className="order-last flex h-12 w-full items-stretch gap-1 md:order-none md:mr-auto md:ml-4 md:h-full md:w-auto md:gap-2">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`flex items-center border-b-[3px] px-3 text-[15px] font-black transition-colors ${i.active ? "border-accent text-ink" : "border-transparent text-ink-soft hover:text-ink"}`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
