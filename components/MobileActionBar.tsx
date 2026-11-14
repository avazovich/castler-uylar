import { telHref } from "@/lib/format";
import { PhoneIcon } from "./icons";
import { LeadDialog } from "./LeadDialog";

/**
 * Phones only: the price and the two things a buyer wants to do — call, or
 * leave a request — stay at the bottom of the screen the whole time they scroll
 * a house page, instead of being a long swipe away below the photos.
 */
export function MobileActionBar({
  label,
  price,
  phone,
  callLabel,
  requestLabel,
  houseCode,
  houseTitle,
}: {
  label: string;
  price: string;
  phone: string;
  callLabel: string;
  requestLabel: string;
  houseCode: number;
  houseTitle: string;
}) {
  return (
    <div className="action-bar fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden">
      <div className="flex items-center gap-2 px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-bold uppercase tracking-wider text-ink-soft">{label}</p>
          <p className="whitespace-nowrap font-display text-[16.5px] leading-tight">{price}</p>
        </div>
        <a
          href={telHref(phone)}
          aria-label={`${callLabel}: ${phone}`}
          className="grid h-12 w-11 shrink-0 place-items-center rounded-lg border border-ink/25 bg-white text-ink active:bg-paper-2"
        >
          <PhoneIcon className="h-5 w-5" />
        </a>
        <LeadDialog
          houseCode={houseCode}
          houseTitle={houseTitle}
          phone={phone}
          className="h-12 shrink-0 rounded-lg bg-accent px-4 text-[13.5px] font-black text-[#21150e] active:bg-accent-hover"
        >
          {requestLabel}
        </LeadDialog>
      </div>
    </div>
  );
}
