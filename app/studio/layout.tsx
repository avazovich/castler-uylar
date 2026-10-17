import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Castler Uylar — Studio",
  robots: { index: false, follow: false },
};

/**
 * Its own root layout, outside app/[locale]/ and deliberately bare — Sanity
 * Studio ships its own complete UI/CSS and must not inherit the site's
 * Tailwind reset, fonts, or any site chrome (Navbar/Footer/Lenis), any one
 * of which would visually clash with or break the Studio's own styling.
 */
export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
