"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const inputCls =
  "w-full bg-surface2 border border-line2 focus:border-gold outline-none rounded-[9px] px-3.5 py-3 text-[15px] text-ivory";

export function LoginForm({
  labels,
}: {
  labels: {
    email: string;
    password: string;
    enter: string;
    error: string;
    rateLimited: string;
    tfaTitle: string;
    tfaHint: string;
    tfaCode: string;
    tfaVerify: string;
    tfaUseBackup: string;
    tfaUseTotp: string;
    tfaError: string;
  };
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"credentials" | "totp">("credentials");
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(err.status === 429 ? labels.rateLimited : labels.error);
      return;
    }
    // Cuentas con 2FA: better-auth pide el segundo paso antes de crear la sesión
    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) {
      setStep("totp");
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = useBackup
      ? await authClient.twoFactor.verifyBackupCode({ code })
      : await authClient.twoFactor.verifyTotp({ code });
    setLoading(false);
    if (err) {
      setError(labels.tfaError);
      return;
    }
    router.push("/portal");
    router.refresh();
  }

  if (step === "totp") {
    return (
      <form onSubmit={onVerify}>
        <p className="text-sm font-semibold mt-6">{labels.tfaTitle}</p>
        <p className="text-xs text-muted mt-1.5">{labels.tfaHint}</p>
        <label className="block mt-4">
          <span className="block text-xs text-muted mb-1.5">{labels.tfaCode}</span>
          <input
            inputMode={useBackup ? "text" : "numeric"}
            maxLength={useBackup ? 20 : 6}
            required
            autoFocus
            autoComplete="one-time-code"
            className={inputCls}
            value={code}
            onChange={(e) => setCode(e.target.value)}
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
          className="w-full mt-5 bg-gold hover:bg-gold2 disabled:opacity-60 text-navy font-semibold text-[15px] py-3.5 rounded-[9px]"
        >
          {loading ? "…" : labels.tfaVerify}
        </button>
        <button
          type="button"
          onClick={() => {
            setUseBackup(!useBackup);
            setCode("");
            setError(null);
          }}
          className="w-full mt-3 text-xs text-muted hover:text-gold"
        >
          {useBackup ? labels.tfaUseTotp : labels.tfaUseBackup}
        </button>
      </form>
    );
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
