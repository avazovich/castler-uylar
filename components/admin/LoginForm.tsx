"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, {});
  return (
    <form action={action} className="mt-8 flex flex-col gap-4">
      <label className="block">
        <span className="label-caps mb-2 block text-ink-soft">Parol</span>
        <input name="password" type="password" autoComplete="current-password" autoFocus required className="field-input" />
      </label>
      {state.error && (
        <p className="border-l-2 border-red-700 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn bg-ink py-4 text-paper hover:bg-gold">
        {pending ? "Tekshirilmoqda…" : "Kirish"}
      </button>
    </form>
  );
}
