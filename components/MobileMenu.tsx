"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { telHref } from "@/lib/format";
import { CloseIcon, MenuIcon, PhoneIcon } from "./icons";
import { LanguageSwitch } from "./LanguageSwitch";

export function MobileMenu({ phone }: { phone: string }) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={t("menu")}
        className="grid h-10 w-10 place-items-center rounded-full bg-paper-2 text-ink md:hidden"
      >
        <MenuIcon />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-x-3 top-3 z-50 rounded-3xl bg-ink p-5 text-cream shadow-2xl">
          <div className="flex items-center justify-between">
            <Dialog.Title className="label-mono text-gold-light">{t("menu")}</Dialog.Title>
            <Dialog.Close aria-label={t("close")} className="grid h-10 w-10 place-items-center rounded-full bg-ink-2">
              <CloseIcon />
            </Dialog.Close>
          </div>
          <nav className="mt-6 flex flex-col">
            {[
              { href: "/loyihalar", label: t("catalog") },
              { href: "/#jarayon", label: t("how") },
              { href: "/#aloqa", label: t("contact") },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="font-display border-b border-line-on-ink py-4 text-3xl"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex items-center justify-between gap-3">
            <LanguageSwitch tone="dark" />
            <a href={telHref(phone)} className="pill bg-gold text-paper">
              <PhoneIcon />
              {phone}
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
