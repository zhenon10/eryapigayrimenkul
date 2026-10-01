import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { DISTRICTS, LISTING_TYPES, TYPE_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/cn";

export function Select({ className, children, ...props }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select {...props} className={cn("field appearance-none pr-9", className)}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
    </div>
  );
}

export function DistrictOptions({ placeholder = "Tüm ilçeler" }: { placeholder?: string }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {DISTRICTS.map((d) => (
        <option key={d.value} value={d.value}>
          {d.label}
        </option>
      ))}
    </>
  );
}

export function TypeOptions({ placeholder = "Tüm tipler" }: { placeholder?: string }) {
  return (
    <>
      <option value="">{placeholder}</option>
      {TYPE_GROUPS.map((g) => (
        <optgroup key={g.value} label={g.label}>
          {LISTING_TYPES.filter((t) => t.group === g.value).map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </optgroup>
      ))}
    </>
  );
}

export function Field({
  label,
  htmlFor,
  icon,
  hint,
  error,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  icon?: ReactNode;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="label flex items-center gap-1.5">
        {icon}
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-micro font-semibold text-danger">{error}</p>
      ) : (
        hint && <p className="text-micro text-muted">{hint}</p>
      )}
    </div>
  );
}

/** Radyo düğmeleri sekme görünümünde; JS gerektirmez. */
export function SegmentedRadio({
  name,
  options,
  defaultValue = "",
  tone = "light",
}: {
  name: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
  tone?: "light" | "muted";
}) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <label key={o.value} className="cursor-pointer">
          <input
            type="radio"
            name={name}
            value={o.value}
            defaultChecked={o.value === defaultValue}
            className="peer sr-only"
          />
          <span
            className={cn(
              "inline-flex min-h-9 items-center rounded-md px-4 text-label font-semibold transition peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-accent",
              tone === "light" ? "bg-canvas text-muted hover:text-ink" : "bg-white text-muted hover:text-ink",
            )}
          >
            {o.label}
          </span>
        </label>
      ))}
    </div>
  );
}
