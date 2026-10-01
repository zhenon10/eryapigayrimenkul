"use client";

import Link from "next/link";
import { startTransition, useActionState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { submitInquiry, type InquiryState } from "@/app/(site)/actions";
import { cn } from "@/lib/cn";
import { DistrictOptions, Field, Select, TypeOptions } from "./form-controls";

type Props = {
  kind: "degerleme" | "iletisim" | "ilan";
  listingId?: number;
  submitLabel?: string;
  messagePlaceholder?: string;
  defaultMessage?: string;
  kvkkLink?: boolean;
  compact?: boolean;
};

export function InquiryForm({
  kind,
  listingId,
  submitLabel = "Gönder",
  messagePlaceholder = "Mesajınız",
  defaultMessage,
  kvkkLink,
  compact,
}: Props) {
  const [state, action, pending] = useActionState<InquiryState, FormData>(submitInquiry, { ok: false });
  const e = state.errors ?? {};
  const id = (n: string) => `${kind}-${n}`;

  if (state.ok)
    return (
      <div role="status" className="flex flex-col items-center gap-3 rounded-lg bg-canvas px-6 py-10 text-center">
        <CheckCircle2 className="size-10 text-success" aria-hidden />
        <p className="font-display text-headline-sm font-semibold">Teşekkürler</p>
        <p className="max-w-sm text-sm text-muted">{state.message}</p>
      </div>
    );

  return (
    <form
      action={action}
      // React 19 form action'dan sonra alanları sıfırlar; hata durumunda girilenler kaybolmasın.
      onSubmit={(ev) => {
        ev.preventDefault();
        const data = new FormData(ev.currentTarget);
        startTransition(() => action(data));
      }}
      className="flex flex-col gap-4"
      noValidate
    >
      <input type="hidden" name="kind" value={kind} />
      {listingId && <input type="hidden" name="listingId" value={listingId} />}
      <div className="hidden" aria-hidden>
        <label>
          Web sitesi <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <Field label="Ad Soyad" htmlFor={id("name")} error={e.name}>
          <input id={id("name")} name="name" autoComplete="name" required className="field" />
        </Field>
        <Field label="Telefon" htmlFor={id("phone")} error={e.phone}>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="05XX XXX XX XX"
            required
            className="field"
          />
        </Field>
      </div>

      {kind === "degerleme" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Mülk Tipi" htmlFor={id("type")} error={e.propertyType}>
            <Select id={id("type")} name="propertyType">
              <TypeOptions placeholder="Seçiniz" />
            </Select>
          </Field>
          <Field label="İlçe" htmlFor={id("district")} error={e.district}>
            <Select id={id("district")} name="district">
              <DistrictOptions placeholder="Seçiniz" />
            </Select>
          </Field>
        </div>
      )}

      {kind === "iletisim" && (
        <Field label="E-posta (isteğe bağlı)" htmlFor={id("email")} error={e.email}>
          <input id={id("email")} name="email" type="email" autoComplete="email" className="field" />
        </Field>
      )}

      <Field label={kind === "degerleme" ? "Mülk Bilgileri" : "Mesaj"} htmlFor={id("message")} error={e.message}>
        <textarea
          id={id("message")}
          name="message"
          rows={compact ? 3 : 4}
          defaultValue={defaultMessage}
          placeholder={messagePlaceholder}
          className="field resize-y"
        />
      </Field>

      <div className="flex flex-col gap-1">
        <label className="flex items-start gap-2.5 text-[13px] leading-5 text-muted">
          <input name="kvkk" type="checkbox" required className="mt-0.5 size-[18px] shrink-0 rounded accent-ink" />
          <span>
            Kişisel verilerimin talebime dönüş yapılması amacıyla işlenmesini kabul ediyorum.
            {kvkkLink && (
              <>
                {" "}
                <Link href="/kvkk" className="font-semibold text-ink underline" target="_blank">
                  Aydınlatma Metni
                </Link>
              </>
            )}
          </span>
        </label>
        {e.kvkk && <p className="text-micro font-semibold text-danger">{e.kvkk}</p>}
      </div>

      {state.message && !state.ok && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
          {state.message}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-accent w-full font-bold">
        <Send className="size-4" aria-hidden />
        {pending ? "Gönderiliyor…" : submitLabel}
      </button>
    </form>
  );
}
