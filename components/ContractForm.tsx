"use client";

import { useActionState } from "react";
import { generateContract, type ContractState } from "@/app/actions/contracts";

const inputCls =
  "w-full bg-surface2 border border-line2 focus:border-gold outline-none rounded-[9px] px-3 py-2.5 text-sm text-ivory";
const labelCls = "block text-xs text-muted mb-1.5";

export type ContractLabels = Record<string, string>;

function Field({
  name,
  label,
  required,
  type = "text",
  full,
}: {
  name: string;
  label: string;
  required?: boolean;
  type?: string;
  full?: boolean;
}) {
  return (
    <label className={full ? "sm:col-span-2 lg:col-span-3" : ""}>
      <span className={labelCls}>{label}</span>
      <input name={name} type={type} required={required} className={inputCls} />
    </label>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="sm:col-span-2 lg:col-span-3 border border-line2 rounded-[10px] p-4 pt-3">
      <legend className="text-xs text-gold px-1.5">{title}</legend>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">{children}</div>
    </fieldset>
  );
}

export function ContractForm({ L }: { L: ContractLabels }) {
  const [state, formAction, pending] = useActionState<ContractState, FormData>(
    generateContract,
    null
  );

  return (
    <form
      action={formAction}
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[960px]"
    >
      <Section title={L.sec_arrendador}>
        <Field name="arrendador1" label={L.l_nombre} required />
        <Field name="arrendador2" label={L.l_nombre2} />
      </Section>

      <Section title={L.sec_arrendatario}>
        <Field name="arrendatario" label={L.l_nombre} required />
        <Field name="arrendatario_nacionalidad" label={L.l_nac} required />
        <Field name="arrendatario_telefono" label={L.l_tel} required />
      </Section>

      <Section title={L.sec_fiador}>
        <Field name="fiador" label={L.l_nombre} />
        <Field name="fiador_nacionalidad" label={L.l_nac} />
        <Field name="fiador_telefono" label={L.l_tel} />
      </Section>

      <Section title={L.sec_inmueble}>
        <Field name="inmueble" label={L.l_inmueble} required full />
        <Field name="uso" label={L.l_uso} required />
        <Field name="escritura" label={L.l_escritura} />
      </Section>

      <Section title={L.sec_economia}>
        <Field name="renta" label={L.l_renta} type="number" required />
        <Field name="deposito" label={L.l_deposito} type="number" required />
        <Field name="banco" label={L.l_banco} required />
        <Field name="cuenta" label={L.l_cuenta} required />
        <Field name="clabe" label={L.l_clabe} required />
        <Field name="titular" label={L.l_titular} required />
      </Section>

      <Section title={L.sec_plazo}>
        <Field name="plazo_meses" label={L.l_meses} type="number" required />
        <Field name="fecha_inicio" label={L.l_inicio} required />
        <Field name="fecha_fin" label={L.l_fin} required />
        <Field name="fecha_firma" label={L.l_firma} required />
        <Field name="lugar_firma" label={L.l_lugar} required />
        <Field name="email_notif" label={L.l_email} />
      </Section>

      {state && !state.ok && (
        <p role="alert" className="sm:col-span-2 lg:col-span-3 text-sm text-red-400">
          {state.message === "PLANTILLA_FALTANTE" ? L.sin_plantilla : state.message}
        </p>
      )}

      {state && state.ok && (
        <div className="sm:col-span-2 lg:col-span-3 bg-gold/[0.07] border border-gold/40 rounded-xl p-4">
          <p className="text-sm text-ivory">{L.ok}</p>
          <div className="flex gap-3 mt-3">
            <a
              href={`/api/uploads/${state.docxPath}`}
              className="bg-gold hover:bg-gold2 text-navy font-semibold text-[13px] px-5 py-2.5 rounded-full"
            >
              ⬇ {L.docx}
            </a>
            {state.pdfPath && (
              <a
                href={`/api/uploads/${state.pdfPath}`}
                target="_blank"
                rel="noreferrer"
                className="border border-gold text-gold hover:bg-gold hover:text-navy text-[13px] px-5 py-2.5 rounded-full transition"
              >
                ⬇ {L.pdf}
              </a>
            )}
          </div>
        </div>
      )}

      <div className="sm:col-span-2 lg:col-span-3 flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-gold hover:bg-gold2 disabled:opacity-60 text-navy font-semibold text-sm px-7 py-3 rounded-full"
        >
          {pending ? "…" : L.generar}
        </button>
      </div>
    </form>
  );
}
