import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext", "cyrillic"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "600"],
});

export const metadata: Metadata = {
  title: "Admin — Castler uy loyihalari",
  robots: { index: false, follow: false },
};

/** Its own root layout (outside [locale]): Uzbek only, no public header/footer. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="min-h-dvh bg-paper-2 text-ink">{children}</body>
    </html>
  );
}
