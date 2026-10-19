"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/lib/houses";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ExpandIcon } from "./icons";

export function Gallery({ images, title }: { images: Img[]; title: string }) {
  const t = useTranslations("house");
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const thumbs = useRef<HTMLDivElement>(null);
  const count = images.length;
  const current = images[index];

  const go = useCallback((delta: number) => setIndex((i) => (i + delta + count) % count), [count]);

  // Keep the active thumbnail in view as the visitor steps through.
  useEffect(() => {
    const el = thumbs.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go]);

  const arrowCls =
    "grid h-12 w-12 place-items-center bg-paper text-ink transition hover:bg-ink hover:text-paper";

  return (
    <div>
      <div className="relative aspect-[4/3] overflow-hidden bg-paper-2">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("enlarge")}
          className="absolute inset-0 cursor-zoom-in"
        >
          <Image
            key={current.url}
            src={current.url}
            alt={`${title} — ${index + 1}`}
            fill
            priority={index === 0}
            sizes="(min-width: 1024px) 60vw, 100vw"
            placeholder={current.lqip ? "blur" : "empty"}
            blurDataURL={current.lqip}
            style={{ objectPosition: current.position }}
            className="object-cover"
          />
        </button>
        {count > 1 && (
          <>
            <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
              <button type="button" onClick={() => go(-1)} aria-label={t("prev")} className={`pointer-events-auto ${arrowCls}`}>
                <ChevronLeftIcon />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={t("next")} className={`pointer-events-auto ${arrowCls}`}>
                <ChevronRightIcon />
              </button>
            </div>
            <span className="label-caps absolute bottom-0 left-0 bg-ink px-3 py-2 text-paper">
              {t("photoCount", { n: index + 1, total: count })}
            </span>
          </>
        )}
        <span className="pointer-events-none absolute bottom-0 right-0 grid h-10 w-10 place-items-center bg-ink text-paper">
          <ExpandIcon className="h-4 w-4" />
        </span>
      </div>

      {count > 1 && (
        <div ref={thumbs} className="no-scrollbar mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-[4/3] w-24 shrink-0 overflow-hidden border-2 transition sm:w-28 ${
                i === index ? "border-ink" : "border-transparent opacity-65 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill sizes="112px" className="object-cover" style={{ objectPosition: img.position }} />
            </button>
          ))}
        </div>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/95" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col p-3 sm:p-6">
            <div className="flex items-center justify-between text-cream">
              <Dialog.Title className="label-caps">
                {title} · {t("photoCount", { n: index + 1, total: count })}
              </Dialog.Title>
              <Dialog.Close aria-label={t("close")} className="grid h-11 w-11 place-items-center border border-line-on-ink text-cream hover:border-cream">
                <CloseIcon />
              </Dialog.Close>
            </div>
            <div className="relative mt-3 flex-1">
              <Image
                src={current.url}
                alt={`${title} — ${index + 1}`}
                fill
                sizes="100vw"
                quality={85}
                className="object-contain"
              />
              {count > 1 && (
                <div className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between">
                  <button type="button" onClick={() => go(-1)} aria-label={t("prev")} className={`pointer-events-auto ${arrowCls}`}>
                    <ChevronLeftIcon />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label={t("next")} className={`pointer-events-auto ${arrowCls}`}>
                    <ChevronRightIcon />
                  </button>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
