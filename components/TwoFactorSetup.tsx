"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const inputCls =
  "w-full bg-surface2 border border-line2 focus:border-gold outline-none rounded-[9px] px-3.5 py-3 text-[15px] text-ivory";
const btnCls =
  "bg-gold hover:bg-gold2 disabled:opacity-60 text-navy font-semibold text-sm px-6 py-3 rounded-[9px]";

export type TfaLabels = {
  on: string;
  off: string;
  introOn: string;
  introOff: string;
  pass: string;
  enable: string;
  disable: string;
  scan: string;
  manual: string;
  code: string;
  confirm: string;
  backupT: string;
  backupS: string;
  done: string;
  err: string;
};

export function TwoFactorSetup({
  initialEnabled,
  labels: L,
}: {
  initialEnabled: boolean;
  labels: TfaLabels;
}) {
  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [qr, setQr] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [doneMsg, setDoneMsg] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function startEnable(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const { data, error: err } = await authClient.twoFactor.enable({ password });
    setLoading(false);
    if (err || !data) {
      setError(true);
      return;
    }
    const uri = data.totpURI;
    setSecret(new URL(uri).searchParams.get("secret"));
    setBackupCodes(data.backupCodes);
    const { toDataURL } = await import("qrcode");
    setQr(await toDataURL(uri, { margin: 1, width: 208 }));
  }

  async function confirmEnable(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const { error: err } = await authClient.twoFactor.verifyTotp({ code });
    setLoading(false);
    if (err) {
      setError(true);
      return;
    }
    setEnabled(true);
    setDoneMsg(true);
    setQr(null);
    setSecret(null);
    setPassword("");
    setCode("");
    router.refresh();
  }

  async function doDisable(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const { error: err } = await authClient.twoFactor.disable({ password });
    setLoading(false);
    if (err) {
      setError(true);
      return;
    }
    setEnabled(false);
    setDoneMsg(false);
    setBackupCodes(null);
    setPassword("");
    router.refresh();
  }

  return (
    <div className="max-w-[560px]">
      <div className="flex items-center gap-2.5">
        <span
          className={`w-2.5 h-2.5 rounded-full ${enabled ? "bg-emerald-500" : "bg-muted/50"}`}
        />
        <span className="text-sm font-semibold">{enabled ? L.on : L.off}</span>
      </div>
      <p className="text-sm leading-[1.7] text-muted mt-3">
        {enabled ? L.introOn : L.introOff}
      </p>

      {doneMsg && <p className="text-sm text-emerald-400 mt-4">{L.done}</p>}

      {backupCodes && (
        <div className="bg-surface border border-gold/40 rounded-xl p-5 mt-5">
          <div className="text-sm font-semibold text-gold">{L.backupT}</div>
          <p className="text-xs text-muted mt-1.5">{L.backupS}</p>
          <div className="grid grid-cols-2 gap-1.5 mt-3 font-mono text-[13px]">
            {backupCodes.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </div>
        </div>
      )}

      {/* Paso 2: escanear QR y confirmar código */}
      {qr && !enabled && (
        <form onSubmit={confirmEnable} className="mt-6">
          <p className="text-sm text-ivory">{L.scan}</p>
          {/* data URL generada localmente; el secreto no sale del navegador */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR TOTP" width={208} height={208} className="rounded-lg mt-3 bg-white p-2" />
          {secret && (
            <p className="text-xs text-muted mt-3">
              {L.manual} <code className="font-mono text-ivory break-all">{secret}</code>
            </p>
          )}
          <label className="block mt-4">
            <span className="block text-xs text-muted mb-1.5">{L.code}</span>
            <input
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              className={inputCls}
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading} className={`${btnCls} mt-4`}>
            {loading ? "…" : L.confirm}
          </button>
        </form>
      )}

      {/* Paso 1: activar (o desactivar) con contraseña */}
      {!qr && (
        <form onSubmit={enabled ? doDisable : startEnable} className="mt-6">
          <label className="block">
            <span className="block text-xs text-muted mb-1.5">{L.pass}</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              className={inputCls}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button type="submit" disabled={loading} className={`${btnCls} mt-4`}>
            {loading ? "…" : enabled ? L.disable : L.enable}
          </button>
        </form>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-400 mt-3">
          {L.err}
        </p>
      )}
    </div>
  );
}
