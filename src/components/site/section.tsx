import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function SectionHeading({
  eyebrow,
  title,
  text,
  align = "left",
  tone = "dark",
  as: As = "h2",
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  text?: ReactNode;
  align?: "left" | "center";
  tone?: "dark" | "light";
  as?: "h1" | "h2";
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "items-center text-center md:flex-col md:items-center",
      )}
    >
      <div className={cn("flex max-w-2xl flex-col gap-3", align === "center" && "items-center")}>
        {eyebrow && <span className={cn("eyebrow", tone === "light" && "text-accent-bright")}>{eyebrow}</span>}
        <As
          className={cn(
            "font-display text-headline-md font-semibold md:text-headline",
            tone === "light" ? "text-white" : "text-ink",
          )}
        >
          {title}
        </As>
        {text && <p className={cn("text-[15px] leading-7", tone === "light" ? "text-ink-muted" : "text-muted")}>{text}</p>}
      </div>
      {children}
    </div>
  );
}

/** İç sayfaların koyu başlık bandı. */
export function PageHero({ eyebrow, title, text, children }: { eyebrow?: string; title: ReactNode; text?: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-ink text-white">
      <div className="pointer-events-none absolute -top-32 right-12 size-96 rounded-full bg-accent/15 blur-3xl" aria-hidden />
      <div className="container-site relative flex flex-col gap-4 py-14 md:py-16">
        {eyebrow && <span className="eyebrow text-accent-bright">{eyebrow}</span>}
        <h1 className="max-w-3xl font-display text-[2.25rem] leading-tight font-semibold md:text-headline">{title}</h1>
        {text && <p className="max-w-2xl text-[15px] leading-7 text-ink-muted">{text}</p>}
        {children}
      </div>
    </section>
  );
}
