"use client";

import { useEffect, useRef } from "react";

/**
 * Menú desplegable del nav basado en <details>, con cierre correcto:
 * - al hacer clic en una opción (enlace interno)
 * - al hacer clic fuera del menú
 * - con la tecla Escape
 * El contenido llega ya renderizado del servidor (children RSC): JS mínimo.
 */
export function NavDropdown({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onDocClick = (e: MouseEvent) => {
      if (el.open && !el.contains(e.target as Node)) el.open = false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && el.open) el.open = false;
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <details
      ref={ref}
      className="relative"
      onClick={(e) => {
        // Al elegir una opción (clic en un <a> del panel), cerrar el menú
        if ((e.target as HTMLElement).closest("a") && ref.current) {
          ref.current.open = false;
        }
      }}
    >
      <summary className="list-none cursor-pointer px-3 py-2 rounded-md hover:text-gold flex items-center gap-1.5">
        {label} <span className="text-[9px] text-gold">▾</span>
      </summary>
      <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 w-[640px] bg-surface border border-line rounded-xl shadow-2xl shadow-black/40 p-3 grid grid-cols-2 gap-1">
        {children}
      </div>
    </details>
  );
}
