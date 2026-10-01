"use client";

import { startTransition, useActionState, type FormEvent } from "react";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

/**
 * useActionState sarmalayıcısı. Formu onSubmit ile gönderir; böylece React 19'un
 * action sonrası otomatik form sıfırlaması devreye girmez ve hata durumunda
 * kullanıcının girdiği değerler korunur.
 */
export function useFormAction(action: (prev: FormState, data: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState(action, {});
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };
  return { state, onSubmit, pending, errors: state.errors ?? {} };
}
