"use client";

import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";

/**
 * Boş alanları URL'ye yazmayan GET formu. JavaScript kapalıyken normal form gibi
 * çalışmaya devam eder; açıkken `?ilce=&tip=` gibi gürültülü adresler oluşmaz.
 */
export function GetForm({ action, ...props }: Omit<ComponentProps<"form">, "action" | "method"> & { action: string }) {
  const router = useRouter();
  return (
    <form
      {...props}
      action={action}
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        for (const [k, v] of new FormData(e.currentTarget)) {
          if (typeof v === "string" && v.trim()) params.append(k, v.trim());
        }
        const qs = params.toString();
        router.push(qs ? `${action}?${qs}` : action);
      }}
    />
  );
}
