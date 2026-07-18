"use client";

import { useActionState } from "react";
import { upsertProperty, type ActionState } from "@/app/actions/properties";

const inputCls =
  "w-full bg-surface2 border border-line2 focus:border-gold outline-none rounded-[9px] px-3 py-3 text-sm text-ivory";
const labelCls = "block text-xs text-muted mb-1.5";

export type PropertyFormLabels = {
  l_tipo: string;
  l_cat: string;
  l_ubic: string;
  l_est: string;
  l_precio: string;
  l_avaluo: string;
  l_precio_consultar: string;
  l_fotos: string;
  l_drop: string;
  l_ficha: string;
  l_m2t: string;
  l_m2c: string;
  l_rec: string;
  l_banos: string;
  l_estac: string;
  l_desc: string;
  publish: string;
  cancel: string;
  adj: string;
  ces: string;
};

export function PropertyForm({
  propertyId,
  defaults,
  labels,
}: {
  propertyId: string | null;
  defaults?: {
    tipo?: string;
    categoria?: string;
    ubicacion?: string;
    estado?: string;
    precio?: number | null;
    avaluo?: number | null;
    precioOculto?: boolean;
    descripcion?: string | null;
    m2Terreno?: number | null;
    m2Construccion?: number | null;
    recamaras?: number | null;
    banos?: number | null;
    estacionamientos?: number | null;
  };
  labels: PropertyFormLabels;
}) {
  const action = upsertProperty.bind(null, propertyId);
  const [state, formAction, pending] = useActionState<ActionState, FormData>(action, null);

  return (
    <form
      action={formAction}
      className="bg-surface border border-line2 rounded-[14px] p-6 sm:p-7 grid sm:grid-cols-2 gap-4.5 max-w-[760px]"
    >
      <label>
        <span className={labelCls}>{labels.l_tipo}</span>
        <select name="tipo" defaultValue={defaults?.tipo ?? "Casa sola"} className={inputCls}>
          {["Casa sola", "Departamento", "Casa en condominio", "Terreno", "Local comercial"].map(
            (tipo) => (
              <option key={tipo}>{tipo}</option>
            )
          )}
        </select>
      </label>
      <label>
        <span className={labelCls}>{labels.l_cat}</span>
        <select
          name="categoria"
          defaultValue={defaults?.categoria ?? "ADJUDICADO"}
          className={inputCls}
        >
          <option value="ADJUDICADO">{labels.adj}</option>
          <option value="CESION">{labels.ces}</option>
        </select>
      </label>
      <label className="sm:col-span-2">
        <span className={labelCls}>{labels.l_ubic}</span>
        <input
          name="ubicacion"
          required
          minLength={3}
          maxLength={160}
          defaultValue={defaults?.ubicacion}
          className={inputCls}
        />
      </label>
      <label>
        <span className={labelCls}>{labels.l_est}</span>
        <select name="estado" defaultValue={defaults?.estado ?? "CDMX"} className={inputCls}>
          {[
            "CDMX",
            "Estado de México",
            "Querétaro",
            "Jalisco",
            "Nuevo León",
            "Puebla",
            "Guanajuato",
          ].map((e) => (
            <option key={e}>{e}</option>
          ))}
        </select>
      </label>
      <label>
        <span className={labelCls}>{labels.l_precio}</span>
        <input
          name="precio"
          type="number"
          min={1}
          step="1"
          defaultValue={defaults?.precio ?? ""}
          className={inputCls}
        />
      </label>
      <label>
        <span className={labelCls}>{labels.l_avaluo}</span>
        <input
          name="avaluo"
          type="number"
          min={1}
          step="1"
          defaultValue={defaults?.avaluo ?? ""}
          className={inputCls}
        />
      </label>
      <label className="flex items-center gap-2.5 text-sm text-muted mt-5">
        <input
          type="checkbox"
          name="precioOculto"
          value="true"
          defaultChecked={defaults?.precioOculto}
          className="accent-[#C8A24A] w-4 h-4"
        />
        {labels.l_precio_consultar}
      </label>

      {/* Ficha técnica estándar (todo opcional) */}
      <fieldset className="sm:col-span-2 border border-line2 rounded-[10px] p-4 pt-3">
        <legend className="text-xs text-gold px-1.5">{labels.l_ficha}</legend>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(
            [
              ["m2Terreno", labels.l_m2t, 1, defaults?.m2Terreno],
              ["m2Construccion", labels.l_m2c, 1, defaults?.m2Construccion],
              ["recamaras", labels.l_rec, 1, defaults?.recamaras],
              ["banos", labels.l_banos, 0.5, defaults?.banos],
              ["estacionamientos", labels.l_estac, 1, defaults?.estacionamientos],
            ] as const
          ).map(([name, label, step, def]) => (
            <label key={name}>
              <span className={labelCls}>{label}</span>
              <input
                name={name}
                type="number"
                min={0}
                step={step}
                defaultValue={def ?? ""}
                className={inputCls}
              />
            </label>
          ))}
        </div>
      </fieldset>

      <label className="sm:col-span-2">
        <span className={labelCls}>{labels.l_desc}</span>
        <textarea
          name="descripcion"
          rows={4}
          maxLength={2000}
          defaultValue={defaults?.descripcion ?? ""}
          className={inputCls}
        />
      </label>
      <label className="sm:col-span-2">
        <span className={labelCls}>{labels.l_fotos}</span>
        <input
          type="file"
          name="fotos"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="block w-full text-sm text-muted file:mr-3 file:bg-surface2 file:border file:border-line file:text-ivory file:text-xs file:px-4 file:py-2 file:rounded-full file:cursor-pointer border border-dashed border-line rounded-[10px] p-5"
        />
        <span className="block text-[11px] text-muted mt-1.5">{labels.l_drop}</span>
      </label>

      {state && !state.ok && (
        <p role="alert" className="sm:col-span-2 text-sm text-red-400">
          {state.message}
        </p>
      )}

      <div className="sm:col-span-2 flex justify-end gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-gold hover:bg-gold2 disabled:opacity-60 text-navy font-semibold text-sm px-7 py-3 rounded-full"
        >
          {pending ? "…" : labels.publish}
        </button>
      </div>
    </form>
  );
}
