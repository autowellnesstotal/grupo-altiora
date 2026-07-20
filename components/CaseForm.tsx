"use client";

import { useActionState } from "react";
import { upsertCase } from "@/app/actions/legal";
import type { ActionState } from "@/app/actions/properties";

const inputCls =
  "w-full bg-surface2 border border-line2 focus:border-gold outline-none rounded-[9px] px-3 py-3 text-sm text-ivory";
const labelCls = "block text-xs text-muted mb-1.5";

export type CaseFormLabels = {
  exp: string;
  juz: string;
  ciudad: string;
  etapa: string;
  estatus: string;
  dem: string;
  dom: string;
  monto: string;
  interes: string;
  fecha: string;
  guardar: string;
  etapas: { ACTIVO: string; PENDIENTE: string; PAGADO: string; ARCHIVADO: string };
};

export function CaseForm({
  caseId,
  defaults,
  labels,
}: {
  caseId: string | null;
  defaults?: {
    expediente?: string;
    juzgado?: string;
    ciudad?: string;
    etapa?: string;
    estatus?: string | null;
    demandado?: string;
    domicilio?: string | null;
    montoAdeudado?: number | null;
    interesPct?: number | null;
    fechaSuscripcion?: string | null; // yyyy-mm-dd
  };
  labels: CaseFormLabels;
}) {
  const action = upsertCase.bind(null, caseId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form
      action={formAction}
      className="bg-surface border border-line2 rounded-[14px] p-6 sm:p-7 grid sm:grid-cols-2 lg:grid-cols-3 gap-4.5 max-w-[880px]"
    >
      <label>
        <span className={labelCls}>{labels.exp}</span>
        <input name="expediente" required maxLength={60} defaultValue={defaults?.expediente} className={inputCls} />
      </label>
      <label>
        <span className={labelCls}>{labels.juz}</span>
        <input name="juzgado" required maxLength={120} defaultValue={defaults?.juzgado} className={inputCls} />
      </label>
      <label>
        <span className={labelCls}>{labels.ciudad}</span>
        <input name="ciudad" required maxLength={80} defaultValue={defaults?.ciudad ?? "Metepec"} className={inputCls} />
      </label>
      <label>
        <span className={labelCls}>{labels.dem}</span>
        <input name="demandado" required maxLength={200} defaultValue={defaults?.demandado} className={inputCls} />
      </label>
      <label className="sm:col-span-2">
        <span className={labelCls}>{labels.dom}</span>
        <input name="domicilio" maxLength={400} defaultValue={defaults?.domicilio ?? ""} className={inputCls} />
      </label>
      <label>
        <span className={labelCls}>{labels.etapa}</span>
        <select name="etapa" defaultValue={defaults?.etapa ?? "ACTIVO"} className={inputCls}>
          {(["ACTIVO", "PENDIENTE", "PAGADO", "ARCHIVADO"] as const).map((e) => (
            <option key={e} value={e}>
              {labels.etapas[e]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className={labelCls}>{labels.monto}</span>
        <input name="montoAdeudado" type="number" min={0} step="0.01" defaultValue={defaults?.montoAdeudado ?? ""} className={inputCls} />
      </label>
      <label>
        <span className={labelCls}>{labels.interes}</span>
        <input name="interesPct" type="number" min={0} max={100} step="0.01" defaultValue={defaults?.interesPct ?? ""} className={inputCls} />
      </label>
      <label>
        <span className={labelCls}>{labels.fecha}</span>
        <input name="fechaSuscripcion" type="date" defaultValue={defaults?.fechaSuscripcion ?? ""} className={inputCls} />
      </label>
      <label className="sm:col-span-2">
        <span className={labelCls}>{labels.estatus}</span>
        <input name="estatus" maxLength={600} defaultValue={defaults?.estatus ?? ""} className={inputCls} />
      </label>

      {state && !state.ok && (
        <p role="alert" className="sm:col-span-2 lg:col-span-3 text-sm text-red-400">
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-gold hover:bg-gold2 disabled:opacity-60 text-navy font-semibold text-sm px-7 py-3 rounded-full"
        >
          {pending ? "…" : labels.guardar}
        </button>
      </div>
    </form>
  );
}
