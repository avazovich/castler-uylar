import type { Metadata } from "next";
import { CalculatorPage, calculatorMetadata } from "@/components/CalculatorPage";

// The build-cost calculator's Uzbek address (see CALC_SLUG in lib/browse.ts).
type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "uz" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return calculatorMetadata("uz");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <CalculatorPage locale={locale} slugLocale="uz" />;
}
