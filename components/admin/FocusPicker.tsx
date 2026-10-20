"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Image from "next/image";
import { useState } from "react";
import { CloseIcon } from "@/components/icons";
import { focusPosition } from "@/lib/focus";
import type { AdminPhoto } from "@/lib/admin/types";

/**
 * Click the house (or whatever matters) on the photo; the previews show
 * exactly how the site's boxes will crop around that point.
 */
export function FocusPicker({
  photo,
  isCover,
  onSave,
  onClose,
}: {
  photo: AdminPhoto;
  isCover: boolean;
  onSave: (focus: AdminPhoto["focus"]) => void;
  onClose: () => void;
}) {
  const [focus, setFocus] = useState(photo.focus);
  const preview = { ...photo, focus };

  function pick(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    setFocus({
      x: Math.round(((e.clientX - r.left) / r.width) * 1000) / 1000,
      y: Math.round(((e.clientY - r.top) / r.height) * 1000) / 1000,
    });
  }

  // Fit the whole photo inside the left pane at its own shape.
  const aspect = photo.width / photo.height;

  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/70" />
        <Dialog.Content className="fixed inset-2 z-50 flex flex-col overflow-y-auto border-t-4 border-gold bg-paper p-5 shadow-2xl md:inset-8 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="font-display text-[30px] leading-tight">Rasm markazini belgilash</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ink-soft">
                Rasmda uyning (yoki eng muhim joyning) o&apos;rtasiga bosing. O&apos;ngda saytda qanday ko&apos;rinishi.
              </Dialog.Description>
            </div>
            <Dialog.Close aria-label="Yopish" className="grid h-10 w-10 shrink-0 place-items-center border border-line hover:border-ink">
              <CloseIcon />
            </Dialog.Close>
          </div>

          <div className="mt-5 grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="grid min-h-0 place-items-center bg-paper-2 p-3">
              <div
                onClick={pick}
                className="relative max-h-[70dvh] w-full cursor-crosshair"
                style={{ aspectRatio: `${photo.width} / ${photo.height}`, maxWidth: `calc(70dvh * ${aspect})` }}
              >
                <Image src={photo.url} alt="" fill sizes="70vw" className="select-none object-contain" draggable={false} />
                <span
                  className="pointer-events-none absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 border-2 border-paper bg-gold/40 shadow-[0_0_0_2px_rgba(26,29,22,0.6)]"
                  style={{ left: `${focus.x * 100}%`, top: `${focus.y * 100}%`, borderRadius: "9999px" }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <p className="label-caps mb-2 text-ink-soft">Katalog kartasi va galereya</p>
                <div className="relative aspect-[4/3] overflow-hidden border border-line bg-paper-2">
                  <Image
                    src={photo.url}
                    alt=""
                    fill
                    sizes="340px"
                    className="object-cover"
                    style={{ objectPosition: focusPosition(preview, 4 / 3) }}
                  />
                </div>
              </div>
              {isCover && (
                <div>
                  <p className="label-caps mb-2 text-ink-soft">Telefondagi bosh banner</p>
                  <div className="relative mx-auto aspect-[9/16] w-1/2 overflow-hidden border border-line bg-paper-2">
                    <Image
                      src={photo.url}
                      alt=""
                      fill
                      sizes="170px"
                      className="object-cover"
                      style={{ objectPosition: focusPosition(preview, 9 / 16) }}
                    />
                  </div>
                </div>
              )}
              <div className="mt-auto flex gap-3">
                <button type="button" onClick={() => onSave(focus)} className="btn flex-1 bg-ink text-paper hover:bg-gold">
                  Saqlash
                </button>
                <button type="button" onClick={onClose} className="btn border border-line text-ink hover:border-ink">
                  Bekor qilish
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
