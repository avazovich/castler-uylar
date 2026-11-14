"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image, { getImageProps } from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Img } from "@/lib/houses";
import { ChevronLeftIcon, ChevronRightIcon, CloseIcon, ExpandIcon } from "./icons";

export function Gallery({ images, title, alts }: { images: Img[]; title: string; alts: string[] }) {
  const t = useTranslations("house");
  const browse = useTranslations("browse");
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const thumbs = useRef<HTMLDivElement>(null);
  const count = images.length;
  const current = images[index];

  const go = useCallback((delta: number) => {
    if (count > 1) setIndex((i) => (i + delta + count) % count);
  }, [count]);
  // Size to the displayed photo, including portrait photos scaled by height.
  const fullscreenSizes = (img: Img) => `min(calc(100vw - 24px), ${Math.round(84 * img.width / Math.max(1, img.height))}dvh, 1440px)`;

  // Keep the active thumbnail in view as the visitor steps through.
  useEffect(() => {
    const strip = thumbs.current;
    const button = strip?.children[index] as HTMLElement | undefined;
    if (!strip || !button) return;
    const offset = button.offsetLeft - strip.scrollLeft;
    if (offset < 0 || offset + button.offsetWidth > strip.clientWidth) {
      strip.scrollLeft = button.offsetLeft - (strip.clientWidth - button.offsetWidth) / 2;
    }
  }, [index]);

  useEffect(() => {
    if (!open || count < 2) return;
    const next = images[(index + 1) % count];
    const { props } = getImageProps({ src: next.url, alt: "", fill: true, sizes: fullscreenSizes(next), quality: 70 });
    const warm = new window.Image();
    warm.fetchPriority = "low";
    warm.sizes = props.sizes ?? "";
    warm.srcset = props.srcSet ?? "";
    warm.src = props.src;
  }, [count, images, index, open]);

  const arrowCls =
    "grid h-11 w-11 place-items-center rounded-md bg-paper text-ink transition hover:bg-ink hover:text-paper";

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-paper-2">
        <button
          ref={opener}
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("enlarge")}
          className="absolute inset-0 cursor-zoom-in"
        >
          <Image
            key={current.url}
            src={current.url}
            alt={alts[index] ?? title}
            fill
            fetchPriority={index === 0 ? "high" : "auto"}
            sizes="(min-width: 1280px) 795px, (min-width: 1024px) 63vw, calc(100vw - 32px)"
            placeholder={current.lqip ? "blur" : "empty"}
            blurDataURL={current.lqip}
            style={{ objectPosition: current.position }}
            className="gallery-photo object-cover"
          />
        </button>
        {count > 1 && (
          <>
            <div className="pointer-events-none absolute inset-x-2.5 top-1/2 flex -translate-y-1/2 justify-between">
              <button type="button" onClick={() => go(-1)} aria-label={t("prev")} className={`pointer-events-auto ${arrowCls}`}>
                <ChevronLeftIcon />
              </button>
              <button type="button" onClick={() => go(1)} aria-label={t("next")} className={`pointer-events-auto ${arrowCls}`}>
                <ChevronRightIcon />
              </button>
            </div>
          </>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-2 bg-black/65 px-4 py-2 pr-12 text-xs text-white">
          <span className="rounded-sm border border-white/45 px-1.5 py-0.5 font-bold">{browse("galleryLabel")}</span>
          <span className="hidden truncate sm:block">{title}</span>
          <span className="ml-auto shrink-0">{index + 1} / {count}</span>
        </div>
        <span className="pointer-events-none absolute bottom-0 right-0 grid h-10 w-10 place-items-center bg-ink text-paper">
          <ExpandIcon className="h-4 w-4" />
        </span>
      </div>

      {count > 1 && (
        <div ref={thumbs} className="no-scrollbar relative mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}`}
              aria-current={i === index}
              className={`relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-md border-2 transition sm:w-28 ${
                i === index ? "border-gold" : "border-transparent opacity-65 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt={alts[i] ?? ""} fill sizes="(min-width: 640px) 108px, 76px" quality={55} className="object-cover" style={{ objectPosition: img.position }} />
            </button>
          ))}
        </div>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/95" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-[60] flex flex-col gap-2 bg-ink px-3 py-2 text-cream sm:px-6 sm:py-4"
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              opener.current?.focus({ preventScroll: true });
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
                event.preventDefault();
                go(event.key === "ArrowRight" ? 1 : -1);
              }
            }}
          >
            <div className="flex min-w-0 items-center justify-between gap-3">
              <Dialog.Title className="truncate text-sm font-semibold">{title}</Dialog.Title>
              <Dialog.Close aria-label={t("close")} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 hover:bg-white/15">
                <CloseIcon />
              </Dialog.Close>
            </div>
            <div className="relative min-h-0 flex-1 touch-pan-y select-none"
              onTouchStart={(event) => {
                const finger = event.touches[0];
                touch.current = event.touches.length === 1 ? { x: finger.clientX, y: finger.clientY } : null;
              }}
              onTouchCancel={() => { touch.current = null; }}
              onTouchEnd={(event) => {
                const start = touch.current;
                touch.current = null;
                if (!start) return;
                const finger = event.changedTouches[0];
                const dx = finger.clientX - start.x;
                const dy = finger.clientY - start.y;
                if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
              }}
            >
              <Image
                key={current.url + index}
                src={current.url}
                alt={alts[index] ?? title}
                fill
                loading="eager"
                sizes={fullscreenSizes(current)}
                quality={70}
                placeholder={current.lqip ? "blur" : "empty"}
                blurDataURL={current.lqip}
                className="pointer-events-none object-contain"
                draggable={false}
              />
            </div>
            <div className="mx-auto flex shrink-0 items-center gap-4 rounded-full border border-white/25 px-1.5 py-1">
              {count > 1 && <button type="button" onClick={() => go(-1)} aria-label={t("prev")} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/15"><ChevronLeftIcon /></button>}
              <span className="min-w-12 text-center text-sm tabular-nums" aria-live="polite">{index + 1} / {count}</span>
              {count > 1 && <button type="button" onClick={() => go(1)} aria-label={t("next")} className="grid h-11 w-11 place-items-center rounded-full hover:bg-white/15"><ChevronRightIcon /></button>}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
