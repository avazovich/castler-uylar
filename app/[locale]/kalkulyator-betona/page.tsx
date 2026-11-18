import type { Metadata } from "next";
import { MaterialPage, materialMetadata } from "@/components/MaterialPage";

// The concrete calculator's Russian address (see MATERIAL_SLUG in content/materials.ts).
type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "ru" }];
}

export function generateMetadata(): Metadata {
  return materialMetadata("concrete", "ru");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <MaterialPage kind="concrete" locale={locale} slugLocale="ru" />;
}
