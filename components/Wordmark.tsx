import Image from "next/image";

// The source wordmark PNGs have the "architectural design company" tagline
// baked into the bottom ~42% of the image. This fraction is how much of the
// top (the "castler" glyphs + registered mark) to keep visible.
const VISIBLE_FRACTION = 0.58;

export function Wordmark({
  variant = "ink",
  height = 24,
  className,
}: {
  variant?: "ink" | "cream";
  height?: number;
  className?: string;
}) {
  const src = variant === "cream" ? "/brand/wordmark-cream.png" : "/brand/wordmark-ink.png";
  const imgHeight = Math.round(height / VISIBLE_FRACTION);

  return (
    <span className={`inline-block overflow-hidden ${className ?? ""}`} style={{ height }}>
      <Image
        src={src}
        alt="Castler"
        width={915}
        height={369}
        style={{ height: imgHeight, width: "auto" }}
      />
    </span>
  );
}
