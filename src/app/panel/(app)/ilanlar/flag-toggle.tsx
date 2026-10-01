"use client";

import { useOptimistic, useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { setListingFlag } from "./actions";

export function FlagToggle({ id, flag, value, label }: { id: number; flag: "isPublished" | "isFeatured"; value: boolean; label: string }) {
  const [optimistic, setOptimistic] = useOptimistic(value);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  return (
    <span className="flex flex-col gap-1">
      <button
        type="button"
        role="switch"
        aria-checked={optimistic}
        aria-label={label}
        disabled={pending}
        onClick={() =>
          start(async () => {
            setError("");
            setOptimistic(!optimistic);
            const res = await setListingFlag(id, flag, !optimistic);
            if (!res.ok) setError(res.message ?? "Hata");
          })
        }
        className={cn(
          "relative h-6 w-11 rounded-full transition disabled:opacity-60",
          optimistic ? (flag === "isPublished" ? "bg-success" : "bg-accent") : "bg-line-strong",
        )}
      >
        <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", optimistic ? "left-[1.375rem]" : "left-0.5")} />
      </button>
      {error && <span className="max-w-32 text-[11px] leading-tight text-danger">{error}</span>}
    </span>
  );
}
