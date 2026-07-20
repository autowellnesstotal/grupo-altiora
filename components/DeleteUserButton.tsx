"use client";

import { useActionState } from "react";
import { deletePortalUser } from "@/app/actions/users";
import type { ActionState } from "@/app/actions/properties";

export function DeleteUserButton({
  userId,
  email,
  labels,
}: {
  userId: string;
  email: string;
  labels: { delete: string; confirm: string };
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    deletePortalUser,
    null
  );

  return (
    <>
      <form
        action={formAction}
        className="inline"
        onSubmit={(e) => {
          if (!confirm(labels.confirm.replace("{email}", email))) e.preventDefault();
        }}
      >
        <input type="hidden" name="userId" value={userId} />
        <button
          disabled={pending}
          className="border border-line text-muted hover:border-red-400 hover:text-red-400 disabled:opacity-50 text-[11px] px-3 py-1.5 rounded-full"
        >
          {pending ? "…" : labels.delete}
        </button>
      </form>
      {state && !state.ok && (
        <p role="alert" className="text-[11px] text-red-400 mt-1.5 max-w-[280px] text-right ml-auto">
          {state.message}
        </p>
      )}
    </>
  );
}
