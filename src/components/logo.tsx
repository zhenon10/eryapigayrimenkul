import { cn } from "@/lib/cn";

/** Stitch logosundaki "ER" monogramı. Yazı kısmı HTML'de, böylece font yüklenmese de kaymaz. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 44 46" className={cn("h-10 w-auto shrink-0", className)} aria-hidden="true">
      <rect x="0" y="0" width="44" height="46" rx="8" fill="#0F172A" />
      <path
        d="M6 12L22 1.5L38 12"
        stroke="#D97706"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13 36V14H31M13 25H27M13 36H31"
        stroke="#D97706"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 7.5H34L39 12.5" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ tone = "dark", tagline = true }: { tone?: "dark" | "light"; tagline?: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span className="flex items-baseline gap-1.5">
          <span
            className={cn("text-[19px] font-extrabold tracking-[0.08em]", tone === "dark" ? "text-ink" : "text-white")}
          >
            ER YAPI
          </span>
          <span className="text-[13px] font-semibold tracking-[0.18em] text-accent">EMLAK</span>
        </span>
        {tagline && (
          <span
            className={cn(
              "mt-1 text-[9.5px] font-medium tracking-[0.2em] uppercase",
              tone === "dark" ? "text-muted" : "text-ink-muted",
            )}
          >
            Gayrimenkul & Yatırım
          </span>
        )}
      </span>
    </span>
  );
}
