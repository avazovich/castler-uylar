import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Lato, Marcellus } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { PageEntrance } from "@/components/PageEntrance";
import { Header } from "@/components/Header";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { preconnect } from "react-dom";
import { Analytics } from "@/components/Analytics";
import "../globals.css";
import "../reference-home.css";

// Cyrillic subsets matter here: the site is fully bilingual (uz / ru).
const inter = Inter({ variable: "--font-inter", subsets: ["latin", "latin-ext", "cyrillic"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["500", "600"],
});

const lato = Lato({ variable: "--font-lato", weight: ["400", "700", "900"], subsets: ["latin"], display: "swap" });
const marcellus = Marcellus({ variable: "--font-marcellus", weight: "400", subsets: ["latin"], display: "swap" });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  const google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  const yandex = process.env.NEXT_PUBLIC_YANDEX_VERIFICATION;
  // Defaults for every page; each page sets its own title, description,
  // canonical/hreflang and share image on top.
  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    applicationName: t("siteName"),
    openGraph: {
      siteName: t("siteName"),
      locale: locale === "ru" ? "ru_RU" : "uz_UZ",
      alternateLocale: locale === "ru" ? ["uz_UZ"] : ["ru_RU"],
      type: "website",
    },
    twitter: { card: "summary_large_image" },
    formatDetection: { telephone: false },
    ...(google || yandex ? { verification: { ...(google ? { google } : {}), ...(yandex ? { yandex } : {}) } } : {}),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  // Every photo comes from Sanity's CDN — open that connection early.
  preconnect("https://cdn.sanity.io");

  return (
    <html lang={locale} className={`${locale === "uz" ? `${lato.variable} ${marcellus.variable}` : `${inter.variable} ${cormorant.variable}`}`}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1"><PageEntrance>{children}</PageEntrance></main>
          <Footer />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
