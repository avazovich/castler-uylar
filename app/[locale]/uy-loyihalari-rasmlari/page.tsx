import type { Metadata } from "next";
import { PhotosPage, photosMetadata } from "@/components/PhotosPage";

// The photos-and-plans page's Uzbek address (see PHOTOS_SLUG in content/photos.ts).
type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "uz" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return photosMetadata("uz");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <PhotosPage locale={locale} slugLocale="uz" />;
}
