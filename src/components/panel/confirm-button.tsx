"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";

/** Silme gibi geri alınamaz işlemler için iki adımlı onay düğmesi. */
export function ConfirmButton({
  onConfirm,
  label = "Sil",
  confirmLabel = "Evet, sil",
  className,
}: {
  onConfirm: () => Promise<unknown>;
  label?: string;
  confirmLabel?: string;
  className?: string;
}) {
  const [asking, setAsking] = useState(false);
  const [pending, start] = useTransition();

  if (!asking)
    return (
      <button type="button" onClick={() => setAsking(true)} className={cn("btn-outline btn-sm text-danger", className)}>
        <Trash2 className="size-4" aria-hidden /> {label}
      </button>
    );

  return (
    <span className="inline-flex items-center gap-1.5">
      <button
        type="button"
        disabled={pending}
        onClick={() => start(async () => void (await onConfirm()))}
        className="btn btn-sm bg-danger text-white hover:bg-red-800"
      >
        {pending ? "Siliniyor…" : confirmLabel}
      </button>
      <button type="button" onClick={() => setAsking(false)} className="btn-outline btn-sm">
        Vazgeç
      </button>
    </span>
  );
}
