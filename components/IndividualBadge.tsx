// The mark for plans Castler first designed for a real client: a serrated
// seal with a tick, used as a sticker on photos and as the icon of the note on
// the plan page.

// 16 points out, 16 in: an exact seal, built once from the circle.
const SEAL =
  Array.from({ length: 32 }, (_, i) => {
    const a = (i * Math.PI) / 16 - Math.PI / 2;
    const r = i % 2 ? 9.4 : 11;
    return `${i ? "L" : "M"}${(12 + r * Math.cos(a)).toFixed(2)} ${(12 + r * Math.sin(a)).toFixed(2)}`;
  }).join("") + "Z";

export function SealIcon({ className = "", check }: { className?: string; check: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path d={SEAL} fill="currentColor" />
      <path d="M8.2 12.4l2.5 2.5 5.1-5.3" fill="none" stroke={check} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The sticker that sits on a plan's photo. */
export function IndividualSticker({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span
      className={`pointer-events-none inline-flex items-center gap-1.5 rounded-full bg-gold py-1 pl-1 pr-3 text-[11px] font-black tracking-[0.06em] text-white uppercase shadow-[0_10px_22px_-10px_rgba(26,29,22,0.8)] ring-1 ring-white/50 ${className}`}
    >
      <SealIcon className="h-5 w-5 text-white" check="var(--gold)" />
      {label}
    </span>
  );
}
