"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const inputCls =
  "w-full bg-surface2 border border-line2 focus:border-gold outline-none rounded-[9px] px-3.5 py-3 text-[15px] text-ivory";

export function LoginForm({
  labels,
}: {
  labels: { email: string; password: string; enter: string; error: string; rateLimited: string };
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(err.status === 429 ? labels.rateLimited : labels.error);
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit}>
      <label className="block mt-6">
        <span className="block text-xs text-muted mb-1.5">{labels.email}</span>
        <input
          type="email"
          required
          autoComplete="email"
          className={inputCls}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label className="block mt-4">
        <span className="block text-xs text-muted mb-1.5">{labels.password}</span>
        <input
          type="password"
          required
          autoComplete="current-password"
          className={inputCls}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-red-400 mt-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full mt-6 bg-gold hover:bg-gold2 disabled:opacity-60 text-navy font-semibold text-[15px] py-3.5 rounded-[9px]"
      >
        {loading ? "…" : labels.enter}
      </button>
    </form>
  );
}
