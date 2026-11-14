"use client";

import { usePathname } from "@/i18n/navigation";

export function PageEntrance({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <div key={pathname} className="page-entrance">{children}</div>;
}
