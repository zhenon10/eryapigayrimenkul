import Link from "next/link";
import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/cn";

export function PageHeader({
  title,
  description,
  action,
  back,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        {back && (
          <Link href={back.href} className="text-micro font-semibold text-muted hover:text-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-headline-md font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function NewButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="btn-accent">
      <Plus className="size-4" aria-hidden /> {label}
    </Link>
  );
}

export function Panel({ title, description, children, className }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card p-5 md:p-6", className)}>
      {title && (
        <header className="mb-5">
          <h2 className="text-base font-bold">{title}</h2>
          {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

const tones = {
  neutral: "bg-panel text-muted",
  success: "bg-green-50 text-success",
  accent: "bg-accent-tint text-accent-strong",
  ink: "bg-ink text-white",
};

export function Badge({ tone = "neutral", children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-micro font-bold", tones[tone])}>{children}</span>;
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 p-12 text-center">
      <p className="font-display text-headline-sm font-semibold">{title}</p>
      {text && <p className="max-w-md text-sm text-muted">{text}</p>}
      {action}
    </div>
  );
}

export function Checkbox({ name, label, defaultChecked, hint }: { name: string; label: string; defaultChecked?: boolean; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-[18px] shrink-0 rounded accent-ink" />
      <span className="flex flex-col">
        <span className="text-sm font-semibold">{label}</span>
        {hint && <span className="text-micro text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function FormStatus({ state }: { state: { ok?: boolean; message?: string } }) {
  if (!state.message) return null;
  return (
    <p
      role={state.ok ? "status" : "alert"}
      className={cn("rounded-md px-3 py-2 text-sm", state.ok ? "bg-green-50 text-success" : "bg-red-50 text-danger")}
    >
      {state.message}
    </p>
  );
}
