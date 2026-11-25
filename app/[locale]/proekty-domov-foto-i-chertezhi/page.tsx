import type { Metadata } from "next";
import { PhotosPage, photosMetadata } from "@/components/PhotosPage";

// The photos-and-plans page's Russian address (see PHOTOS_SLUG in content/photos.ts).
type Props = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return [{ locale: "ru" }];
}

export async function generateMetadata(): Promise<Metadata> {
  return photosMetadata("ru");
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  return <PhotosPage locale={locale} slugLocale="ru" />;
}
