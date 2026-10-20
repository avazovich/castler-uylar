"use client";

import { groupDigits } from "@/lib/admin/types";

export function Section({
  title,
  hint,
  children,
  id,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} className="scroll-mt-24 border border-line bg-paper">
      <header className="border-b border-line px-5 py-4 md:px-6">
        <h2 className="font-display text-[26px] leading-tight">{title}</h2>
        {hint && <p className="mt-1 text-sm text-ink-soft">{hint}</p>}
      </header>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block min-w-0 ${className}`}>
      <span className="label-caps mb-2 block text-ink-soft">{label}</span>
      {children}
      {error ? (
        <span className="mt-1.5 block text-sm text-red-700" role="alert">
          {error}
        </span>
      ) : (
        hint && <span className="mt-1.5 block text-xs text-ink-soft">{hint}</span>
      )}
    </label>
  );
}

const errorCls = (error?: string) => (error ? "border-red-700" : "");

export function TextInput({
  value,
  onChange,
  error,
  ...rest
}: { value: string; onChange: (v: string) => void; error?: string } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  return <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={`field-input ${errorCls(error)}`} />;
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="field-input resize-y"
    />
  );
}

/** Whole numbers shown grouped as you type: 6 600 000. */
export function PriceInput({
  value,
  onChange,
  error,
  suffix,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(groupDigits(e.target.value))}
        className={`field-input ${suffix ? "pr-16" : ""} ${errorCls(error)}`}
      />
      {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-soft">{suffix}</span>}
    </div>
  );
}

/** Decimals allowed with a comma or dot: 5,4. */
export function DecimalInput({
  value,
  onChange,
  error,
  suffix,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  error?: string;
  suffix?: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        inputMode="decimal"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, "").replace(".", ","))}
        className={`field-input ${suffix ? "pr-16" : ""} ${errorCls(error)}`}
      />
      {suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ink-soft">{suffix}</span>}
    </div>
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: string;
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`field-select ${errorCls(error)}`}>
      {placeholder != null && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 border border-line p-4 hover:border-ink-soft">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 h-4 w-4 accent-[var(--ink)]" />
      <span>
        <span className="block font-medium">{label}</span>
        {hint && <span className="mt-0.5 block text-sm text-ink-soft">{hint}</span>}
      </span>
    </label>
  );
}
