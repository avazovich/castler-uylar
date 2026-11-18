import type { Metadata } from "next";
import { MaterialPage, materialMetadata } from "@/components/MaterialPage";

// The block calculator's Uzbek address (see MATERIAL_SLUG in content/materials.ts).
type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "uz" }];
}

export function generateMetadata(): Metadata {
  return materialMetadata("block", "uz");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <MaterialPage kind="block" locale={locale} slugLocale="uz" />;
}
