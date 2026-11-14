"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";

// True once the visitor has moved to a second page. The very first page comes
// ready-made from the server and must not flash; every page after that rises
// in (see .page-entrance in globals.css), and its card grids pop in one by one.
let navigated = false;

function Entrance({ children }: { children: React.ReactNode }) {
  // Decided once, when this page's wrapper is created — a later re-render of
  // the same page must never replay the animation.
  const [motion] = useState(() => (navigated ? "on" : "off"));
  useEffect(() => {
    navigated = true;
  }, []);
  return (
    <div className="page-entrance" data-motion={motion}>
      {children}
    </div>
  );
}

export function PageEntrance({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // A new key per page: the wrapper is rebuilt on every page change.
  return <Entrance key={pathname}>{children}</Entrance>;
}
