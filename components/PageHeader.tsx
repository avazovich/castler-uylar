import { Link } from "@/i18n/navigation";

export interface Crumb {
  label: string;
  href?: string;
}

/** Grey band at the top of inner pages: breadcrumbs, title, optional line. */
export function PageHeader({ crumbs, title, subtitle }: { crumbs: Crumb[]; title?: string; subtitle?: string }) {
  return (
    <section className="border-b border-line bg-paper-2">
      <div className={`mx-auto max-w-[1280px] px-4 md:px-8 ${title ? "py-10 md:py-14" : "py-4"}`}>
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-ink-soft">
            {crumbs.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-line">/</span>}
                {c.href ? (
                  <Link href={c.href} className="hover:text-ink">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-ink" aria-current="page">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
        {title && <h1 className="font-display mt-4 text-[44px] leading-[1.05] text-ink md:text-[64px]">{title}</h1>}
        {subtitle && <p className="mt-3 max-w-2xl text-lg text-ink-soft">{subtitle}</p>}
      </div>
    </section>
  );
}

/** Gold rule + small caps eyebrow over a serif section heading. */
export function SectionTitle({
  eyebrow,
  title,
  tone = "light",
  className = "",
}: {
  eyebrow?: string;
  title: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow && (
        <p className={`label-caps flex items-center gap-3 ${tone === "dark" ? "text-gold-light" : "text-gold"}`}>
          <span className="h-px w-10 bg-current" />
          {eyebrow}
        </p>
      )}
      <h2 className={`font-display mt-4 text-[38px] leading-[1.08] md:text-[54px] ${tone === "dark" ? "text-cream" : "text-ink"}`}>
        {title}
      </h2>
    </div>
  );
}
