"use client";

import { FormStatus } from "@/components/panel/ui";
import { useFormAction } from "@/components/panel/use-form-action";
import { Field } from "@/components/site/form-controls";
import { changeOwnPassword } from "../kullanicilar/actions";

export function ChangePasswordForm() {
  const { state, onSubmit, pending, errors: e } = useFormAction(changeOwnPassword);
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field label="Mevcut Şifre" htmlFor="current" error={e.current}>
        <input id="current" name="current" type="password" autoComplete="current-password" required className="field" />
      </Field>
      <Field label="Yeni Şifre" htmlFor="next" hint="En az 10 karakter." error={e.next}>
        <input id="next" name="next" type="password" autoComplete="new-password" required minLength={10} className="field" />
      </Field>
      <Field label="Yeni Şifre (tekrar)" htmlFor="confirm" error={e.confirm}>
        <input id="confirm" name="confirm" type="password" autoComplete="new-password" required className="field" />
      </Field>
      <FormStatus state={state} />
      <button type="submit" disabled={pending} className="btn-primary self-start">
        {pending ? "Kaydediliyor…" : "Şifreyi Değiştir"}
      </button>
    </form>
  );
}
