"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { CloseIcon } from "./icons";
import { LeadForm } from "./LeadForm";

export function LeadDialog({
  houseCode,
  houseTitle,
  phone,
  className,
  children,
}: {
  houseCode: number;
  houseTitle: string;
  phone: string;
  className?: string;
  children: React.ReactNode;
}) {
  const t = useTranslations("lead");

  return (
    <Dialog.Root>
      <Dialog.Trigger className={className}>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/60" />
        <Dialog.Content className="fixed inset-x-3 bottom-3 z-50 max-h-[calc(100dvh-24px)] overflow-y-auto border-t-4 border-gold bg-paper p-6 shadow-2xl sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:w-[460px] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-[34px] leading-tight text-ink">{t("titleHouse")}</Dialog.Title>
              <Dialog.Description className="mt-2 text-sm text-ink-soft">
                {t("subtitleHouse", { house: houseTitle })}
              </Dialog.Description>
            </div>
            <Dialog.Close
              aria-label={t("close")}
              className="grid h-10 w-10 shrink-0 place-items-center border border-line text-ink hover:border-ink"
            >
              <CloseIcon />
            </Dialog.Close>
          </div>
          <LeadForm houseCode={houseCode} phone={phone} autoFocus />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
