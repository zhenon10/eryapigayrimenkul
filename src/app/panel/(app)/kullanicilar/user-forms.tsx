"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { ConfirmButton } from "@/components/panel/confirm-button";
import { FormStatus } from "@/components/panel/ui";
import { useFormAction } from "@/components/panel/use-form-action";
import { Field, Select } from "@/components/site/form-controls";
import { createUser, deleteUser, resetUserPassword } from "./actions";

export function NewUserForm() {
  const { state, onSubmit, pending, errors: e } = useFormAction(createUser);
  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Ad Soyad" htmlFor="u-name" error={e.name}>
        <input id="u-name" name="name" required className="field" />
      </Field>
      <Field label="E-posta" htmlFor="u-email" error={e.email}>
        <input id="u-email" name="email" type="email" required className="field" />
      </Field>
      <Field label="Rol" htmlFor="u-role" hint="Editör: ilan, danışman, talep ve ayarlar. Yönetici: ayrıca kullanıcılar." error={e.role}>
        <Select id="u-role" name="role" defaultValue="editor">
          <option value="editor">Editör</option>
          <option value="admin">Yönetici</option>
        </Select>
      </Field>
      <Field label="Geçici Şifre" htmlFor="u-password" hint="En az 10 karakter." error={e.password}>
        <input id="u-password" name="password" type="text" autoComplete="new-password" required minLength={10} className="field" />
      </Field>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <button type="submit" disabled={pending} className="btn-primary">
          <UserPlus className="size-4" aria-hidden /> Kullanıcı Ekle
        </button>
        <FormStatus state={state} />
      </div>
    </form>
  );
}

export function UserRowActions({ id, isSelf }: { id: number; isSelf: boolean }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const { state, onSubmit, pending } = useFormAction(resetUserPassword.bind(null, id));

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex gap-1.5">
        <button type="button" onClick={() => setOpen((o) => !o)} className="btn-outline btn-sm">
          Şifre Sıfırla
        </button>
        {!isSelf && (
          <ConfirmButton
            onConfirm={async () => {
              const res = await deleteUser(id);
              if (!res.ok) setError(res.message ?? "");
            }}
          />
        )}
      </div>
      {open && (
        <form onSubmit={onSubmit} className="flex w-full max-w-xs gap-1.5">
          <input name="password" type="text" required minLength={10} placeholder="Yeni şifre" aria-label="Yeni şifre" className="field min-h-9 py-1" />
          <button type="submit" disabled={pending} className="btn-primary btn-sm">
            Kaydet
          </button>
        </form>
      )}
      <FormStatus state={state} />
      {error && <p className="text-micro text-danger">{error}</p>}
    </div>
  );
}
