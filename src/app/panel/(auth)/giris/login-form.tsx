"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { Field } from "@/components/site/form-controls";
import { login, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, {});
  return (
    <form action={action} className="flex flex-col gap-4">
      <Field label="E-posta" htmlFor="email">
        <input id="email" name="email" type="email" autoComplete="username" required autoFocus className="field" />
      </Field>
      <Field label="Şifre" htmlFor="password">
        <input id="password" name="password" type="password" autoComplete="current-password" required className="field" />
      </Field>
      {state.error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn-primary mt-2">
        <LogIn className="size-4" aria-hidden /> {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
