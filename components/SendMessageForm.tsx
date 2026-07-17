"use client";

import { useActionState, useRef, useEffect } from "react";
import { sendMessage } from "@/app/actions/messages";
import type { ActionState } from "@/app/actions/properties";

export function SendMessageForm({
  threadUserId,
  labels,
}: {
  threadUserId?: string;
  labels: { ph: string; send: string };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(sendMessage, null);
  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);

  return (
    <form ref={ref} action={formAction} className="flex gap-2.5 border-t border-line2 p-3.5">
      {threadUserId && <input type="hidden" name="threadUserId" value={threadUserId} />}
      <input
        name="body"
        required
        maxLength={2000}
        placeholder={labels.ph}
        className="flex-1 bg-surface2 border border-line2 focus:border-gold outline-none rounded-full px-4 py-3 text-sm text-ivory"
      />
      <button
        disabled={pending}
        className="bg-gold hover:bg-gold2 disabled:opacity-60 text-navy font-semibold px-6 rounded-full text-sm"
      >
        {pending ? "…" : labels.send}
      </button>
    </form>
  );
}
