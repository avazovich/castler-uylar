"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { telHref } from "@/lib/format";
import { ArrowRightIcon, CloseIcon, MenuIcon, PhoneIcon, TelegramIcon } from "./icons";
import { LanguageSwitch } from "./LanguageSwitch";
import type { NavItem } from "./NavLinks";

/**
 * Phone menu: a full-screen sheet built for thumbs. Search is the first thing
 * in it, every link is a tall easy row, and the two ways to reach Castler
 * (call, Telegram) stay pinned to the bottom so they never need scrolling to.
 */
export function MobileMenu({
  items,
  phone,
  telegram,
  mainSite,
}: {
  items: NavItem[];
  phone: string;
  telegram?: string;
  mainSite: { href: string; label: string };
}) {
  const t = useTranslations("nav");
  const browse = useTranslations("browse");
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger
        aria-label={t("menu")}
        className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white text-ink lg:hidden"
      >
        <MenuIcon />
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="anim-overlay fixed inset-0 z-50 bg-ink/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="anim-menu fixed inset-0 z-50 flex flex-col bg-paper-2 text-ink"
        >
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-line bg-paper px-4">
            <Dialog.Title className="font-display text-[22px]">{t("menu")}</Dialog.Title>
            <Dialog.Close aria-label={t("close")} className="grid h-11 w-11 place-items-center rounded-lg border border-line bg-white text-ink">
              <CloseIcon />
            </Dialog.Close>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4">
            <form
              role="search"
              className="mt-4 flex gap-2 rounded-lg border border-[#c4bfb4] bg-white p-1 focus-within:border-[#8a847a]"
              onSubmit={(event) => {
                event.preventDefault();
                const q = String(new FormData(event.currentTarget).get("q") ?? "").trim();
                close();
                router.push(q ? `/loyihalar?${new URLSearchParams({ q })}` : "/loyihalar");
              }}
            >
              <input
                name="q"
                type="search"
                maxLength={120}
                enterKeyHint="search"
                placeholder={browse("keyword")}
                aria-label={browse("keyword")}
                className="h-12 min-w-0 flex-1 bg-transparent px-3 text-base"
              />
              <button className="h-12 rounded-md bg-accent px-5 text-sm font-black text-[#21150e] active:bg-accent-hover">
                {browse("search")}
              </button>
            </form>

            <nav className="mt-2 flex flex-col">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="flex min-h-14 items-center justify-between gap-3 border-b border-line text-[17px] font-bold active:bg-paper"
                >
                  {item.label}
                  <ArrowRightIcon className="h-4 w-4 shrink-0 text-ink-soft" />
                </Link>
              ))}
            </nav>
          </div>

          <div className="shrink-0 space-y-3 border-t border-line bg-paper p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className={`grid gap-3 ${telegram ? "grid-cols-2" : "grid-cols-1"}`}>
              <a
                href={telHref(phone)}
                className="flex h-14 items-center justify-center gap-2 rounded-lg bg-accent text-[15px] font-black text-[#21150e] active:bg-accent-hover"
              >
                <PhoneIcon className="h-5 w-5" />
                {t("call")}
              </a>
              {telegram && (
                <a
                  href={`https://t.me/${telegram}`}
                  target="_blank"
                  rel="noopener"
                  className="flex h-14 items-center justify-center gap-2 rounded-lg border border-ink/25 bg-white text-[15px] font-black active:bg-paper-2"
                >
                  <TelegramIcon className="h-5 w-5" />
                  Telegram
                </a>
              )}
            </div>
            <div className="flex items-center justify-between">
              <a
                href={mainSite.href}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-ink underline decoration-ink/30 underline-offset-4"
              >
                {mainSite.label}
                <ArrowRightIcon className="h-3.5 w-3.5 -rotate-45 text-gold" />
              </a>
              <LanguageSwitch tone="light" />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
