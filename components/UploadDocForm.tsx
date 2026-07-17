"use client";

import { useActionState } from "react";
import { uploadDocument } from "@/app/actions/documents";
import type { ActionState } from "@/app/actions/properties";

export function UploadDocForm({
  properties,
  labels,
}: {
  properties: { id: string; clave: string; tipo: string }[];
  labels: { upload: string; title: string };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(uploadDocument, null);

  return (
    <form
      action={formAction}
      className="bg-surface border border-line2 rounded-xl p-5 grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end max-w-[760px]"
    >
      <label className="block">
        <span className="block text-xs text-muted mb-1.5">ALT</span>
        <select
          name="propertyId"
          className="w-full bg-surface2 border border-line2 rounded-lg px-3 py-2.5 text-sm text-ivory"
        >
          {properties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.clave} · {p.tipo}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="block text-xs text-muted mb-1.5">{labels.title}</span>
        <input
          name="title"
          required
          minLength={2}
          maxLength={120}
          className="w-full bg-surface2 border border-line2 focus:border-gold outline-none rounded-lg px-3 py-2.5 text-sm text-ivory"
        />
      </label>
      <div className="flex items-center gap-3">
        <input
          type="file"
          name="file"
          accept="application/pdf"
          required
          className="text-xs text-muted max-w-[180px]"
        />
        <button
          disabled={pending}
          className="bg-gold hover:bg-gold2 disabled:opacity-60 text-navy font-semibold text-[13px] px-5 py-2.5 rounded-full whitespace-nowrap"
        >
          {pending ? "…" : labels.upload}
        </button>
      </div>
      {state && !state.ok && (
        <p role="alert" className="sm:col-span-3 text-sm text-red-400">
          {state.message}
        </p>
      )}
    </form>
  );
}
