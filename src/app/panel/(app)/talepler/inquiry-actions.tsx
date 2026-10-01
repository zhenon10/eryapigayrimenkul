"use client";

import { useTransition } from "react";
import { ConfirmButton } from "@/components/panel/confirm-button";
import { Select } from "@/components/site/form-controls";
import { INQUIRY_STATES } from "@/lib/constants";
import { deleteInquiry, updateInquiry } from "./actions";

export function InquiryActions({ id, state, note }: { id: number; state: string; note: string }) {
  const [pending, start] = useTransition();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        start(() => updateInquiry(id, data));
      }}
      className="flex flex-col gap-2 lg:w-64"
    >
      <Select
        name="state"
        defaultValue={state}
        aria-label="Talep durumu"
        onChange={(e) => {
          const data = new FormData(e.currentTarget.form!);
          start(() => updateInquiry(id, data));
        }}
      >
        {INQUIRY_STATES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
      <textarea name="note" defaultValue={note} rows={2} placeholder="İç not (sadece panelde görünür)" aria-label="İç not" className="field text-micro" />
      <div className="flex items-center justify-between gap-2">
        <button type="submit" disabled={pending} className="btn-outline btn-sm">
          {pending ? "Kaydediliyor…" : "Notu kaydet"}
        </button>
        <ConfirmButton onConfirm={() => deleteInquiry(id)} label="Sil" />
      </div>
    </form>
  );
}
