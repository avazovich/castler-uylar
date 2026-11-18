import type { Metadata } from "next";
import { MaterialPage, materialMetadata } from "@/components/MaterialPage";

// The block calculator's Russian address (see MATERIAL_SLUG in content/materials.ts).
type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "ru" }];
}

export function generateMetadata(): Metadata {
  return materialMetadata("block", "ru");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <MaterialPage kind="block" locale={locale} slugLocale="ru" />;
}
