"use client";

import { useMemo, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import type { PropertyCardData } from "@/lib/types";

type Labels = {
  tagLegal: string;
  photoPh: string;
  avaluo: string;
  ver: string;
  consult: string;
  adj: string;
  ces: string;
  results: string;
  empty: string;
  f_estado: string;
  f_tipoinv: string;
  f_tipoinm: string;
  f_precio: string;
  f_sel: string;
  price_low: string;
  price_mid: string;
  price_high: string;
  ab_rec: string;
  ab_banos: string;
  ab_bano_1: string;
};

const selectCls =
  "w-full bg-surface2 text-ivory border border-line2 rounded-lg px-3 py-2.5 text-[15px]";

export function CatalogGrid({ items, labels }: { items: PropertyCardData[]; labels: Labels }) {
  const [estado, setEstado] = useState("");
  const [categoria, setCategoria] = useState("");
  const [tipo, setTipo] = useState("");
  const [precio, setPrecio] = useState("");

  const estados = useMemo(() => [...new Set(items.map((p) => p.estado))].sort(), [items]);
  const tipos = useMemo(() => [...new Set(items.map((p) => p.tipo))].sort(), [items]);

  const filtered = items.filter((p) => {
    if (estado && p.estado !== estado) return false;
    if (categoria && p.categoria !== categoria) return false;
    if (tipo && p.tipo !== tipo) return false;
    if (precio) {
      const v = p.precio ?? Infinity;
      if (precio === "low" && !(v < 3_000_000)) return false;
      if (precio === "mid" && !(v >= 3_000_000 && v <= 5_000_000)) return false;
      if (precio === "high" && !(v > 5_000_000)) return false;
    }
    return true;
  });

  return (
    <>
      <div className="bg-surface border border-line rounded-[14px] p-4 grid grid-cols-2 lg:grid-cols-4 gap-3 shadow-2xl shadow-black/30">
        {[
          {
            label: labels.f_estado,
            value: estado,
            set: setEstado,
            options: estados.map((e) => [e, e] as [string, string]),
          },
          {
            label: labels.f_tipoinv,
            value: categoria,
            set: setCategoria,
            options: [
              ["ADJUDICADO", labels.adj],
              ["CESION", labels.ces],
            ] as [string, string][],
          },
          {
            label: labels.f_tipoinm,
            value: tipo,
            set: setTipo,
            options: tipos.map((t) => [t, t] as [string, string]),
          },
          {
            label: labels.f_precio,
            value: precio,
            set: setPrecio,
            options: [
              ["low", labels.price_low],
              ["mid", labels.price_mid],
              ["high", labels.price_high],
            ] as [string, string][],
          },
        ].map((f) => (
          <label key={f.label} className="block">
            <span className="block text-[11px] tracking-[0.1em] uppercase text-muted mb-1.5">
              {f.label}
            </span>
            <select className={selectCls} value={f.value} onChange={(e) => f.set(e.target.value)}>
              <option value="">{labels.f_sel}</option>
              {f.options.map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="text-[15px] text-muted mt-6 mb-5">
        <span className="font-serif text-[22px] text-gold">{filtered.length}</span>{" "}
        {labels.results}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted py-10 text-center">{labels.empty}</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <PropertyCard
              key={p.id}
              p={p}
              labels={{
                tagLegal: labels.tagLegal,
                photoPh: labels.photoPh,
                avaluo: labels.avaluo,
                ver: labels.ver,
                consult: labels.consult,
                catLabel: p.categoria === "ADJUDICADO" ? labels.adj : labels.ces,
                abRec: labels.ab_rec,
                abBanos: labels.ab_banos,
                abBano1: labels.ab_bano_1,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
