"use client";

import { Link, usePathname } from "@/i18n/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/** Main navigation with a gold underline on the current page. */
export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav className="hidden min-h-12 flex-wrap items-stretch gap-x-4 lg:flex xl:gap-x-6">
      {items.map((item) => {
        const path = item.href.split("#")[0] || "/";
        const active = !item.href.includes("#") && (path === "/" ? pathname === "/" : pathname.startsWith(path));
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`label-caps flex items-center whitespace-nowrap border-b-2 py-3 text-[12px] transition-colors ${
              active ? "border-gold text-ink" : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
