import { useTranslations } from "next-intl";
import { ArrowLeftIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="mx-auto flex max-w-[1360px] flex-col items-start px-4 py-28 md:px-8 md:py-40">
      <p className="label-mono text-gold">404</p>
      <h1 className="font-display mt-3 text-5xl text-ink md:text-7xl">{t("title")}</h1>
      <p className="mt-4 text-lg text-ink-soft">{t("text")}</p>
      <Link href="/loyihalar" className="pill mt-8 bg-ink text-paper hover:bg-ink-2">
        <ArrowLeftIcon className="h-4 w-4" /> {t("back")}
      </Link>
    </div>
  );
}
