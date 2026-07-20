"use client";

import { useActionState, useRef, useEffect } from "react";
import { createPortalUser } from "@/app/actions/users";
import type { ActionState } from "@/app/actions/properties";

const inputCls =
  "w-full bg-surface2 border border-line2 focus:border-gold outline-none rounded-lg px-3 py-2.5 text-sm text-ivory";

export function CreateUserForm({
  labels,
}: {
  labels: {
    name: string;
    email: string;
    pass: string;
    role: string;
    create: string;
    created: string;
    roles: { admin: string; agente: string; inversionista: string; legal: string };
  };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createPortalUser,
    null
  );
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form
      ref={ref}
      action={formAction}
      className="bg-surface border border-line2 rounded-xl p-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end max-w-[900px]"
    >
      <label className="block">
        <span className="block text-xs text-muted mb-1.5">{labels.name}</span>
        <input name="name" required minLength={2} maxLength={80} className={inputCls} />
      </label>
      <label className="block">
        <span className="block text-xs text-muted mb-1.5">{labels.email}</span>
        <input name="email" type="email" required className={inputCls} />
      </label>
      <label className="block">
        <span className="block text-xs text-muted mb-1.5">{labels.pass}</span>
        <input name="password" type="password" required minLength={12} className={inputCls} />
      </label>
      <div className="flex gap-2.5 items-end">
        <label className="block flex-1">
          <span className="block text-xs text-muted mb-1.5">{labels.role}</span>
          <select name="role" defaultValue="inversionista" className={inputCls}>
            <option value="inversionista">{labels.roles.inversionista}</option>
            <option value="agente">{labels.roles.agente}</option>
            <option value="legal">{labels.roles.legal}</option>
            <option value="admin">{labels.roles.admin}</option>
          </select>
        </label>
        <button
          disabled={pending}
          className="bg-gold hover:bg-gold2 disabled:opacity-60 text-navy font-semibold text-[13px] px-5 py-2.5 rounded-full whitespace-nowrap"
        >
          {pending ? "…" : labels.create}
        </button>
      </div>
      {state && (
        <p
          role="alert"
          className={`sm:col-span-2 lg:col-span-4 text-sm ${state.ok ? "text-[#4ade80]" : "text-red-400"}`}
        >
          {state.ok ? labels.created : state.message}
        </p>
      )}
    </form>
  );
}
