"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { telHref } from "@/lib/format";
import { ArrowRightIcon, CloseIcon, MenuIcon, PhoneIcon } from "./icons";
import { LanguageSwitch } from "./LanguageSwitch";
import type { NavItem } from "./NavLinks";

export function MobileMenu({
  items,
  phone,
  mainSite,
}: {
  items: NavItem[];
  phone: string;
  mainSite: { href: string; label: string };
}) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={t("menu")}
        className="grid h-11 w-11 place-items-center border border-line text-ink lg:hidden"
      >
        <MenuIcon />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50" />
        <Dialog.Content className="fixed inset-x-0 top-0 z-50 bg-paper shadow-2xl">
          <div className="flex h-[72px] items-center justify-between border-b border-line px-4">
            <Dialog.Title className="label-caps text-ink-soft">{t("menu")}</Dialog.Title>
            <Dialog.Close aria-label={t("close")} className="grid h-11 w-11 place-items-center border border-line text-ink">
              <CloseIcon />
            </Dialog.Close>
          </div>
          <nav className="flex flex-col px-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className="label-caps border-b border-line py-5 text-[13px] text-ink"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={mainSite.href}
              target="_blank"
              rel="noopener"
              className="label-caps flex items-center justify-between border-b border-line py-5 text-[13px] text-ink"
            >
              {mainSite.label}
              <ArrowRightIcon className="h-4 w-4 -rotate-45 text-gold" />
            </a>
          </nav>
          <div className="flex items-center justify-between gap-3 p-4">
            <LanguageSwitch tone="light" />
            <a href={telHref(phone)} className="btn bg-ink px-5 text-paper">
              <PhoneIcon className="h-4 w-4" />
              {phone}
            </a>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
