import type { Metadata } from "next";
import { Lato, Marcellus } from "next/font/google";
import "../globals.css";

// The same two typefaces as the public site (Lato for text, Marcellus for headings).
const lato = Lato({ variable: "--font-lato", weight: ["400", "700", "900"], subsets: ["latin", "latin-ext"], display: "swap" });
const marcellus = Marcellus({ variable: "--font-marcellus", weight: "400", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Admin — Castler uy loyihalari",
  robots: { index: false, follow: false },
};

/** Its own root layout (outside [locale]): Uzbek only, no public header/footer. */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" className={`${lato.variable} ${marcellus.variable}`}>
      <body className="min-h-dvh bg-paper-2 text-ink">{children}</body>
    </html>
  );
}
