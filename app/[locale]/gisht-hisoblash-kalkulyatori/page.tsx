import type { Metadata } from "next";
import { MaterialPage, materialMetadata } from "@/components/MaterialPage";

// The brick calculator's Uzbek address (see MATERIAL_SLUG in content/materials.ts).
type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "uz" }];
}

export function generateMetadata(): Metadata {
  return materialMetadata("brick", "uz");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <MaterialPage kind="brick" locale={locale} slugLocale="uz" />;
}
