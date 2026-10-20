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
    <nav className="order-last flex h-11 w-full items-stretch gap-6 md:order-none md:h-full md:w-auto">
      {items.map((i) => (
        <Link
          key={i.href}
          href={i.href}
          className={`label-caps flex items-center border-b-2 pt-0.5 ${i.active ? "border-gold text-cream" : "border-transparent text-cream/60 hover:text-cream"}`}
        >
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
