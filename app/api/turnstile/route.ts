import { NextResponse } from "next/server";

// Entrega la clave pública de Turnstile leída del entorno EN EJECUCIÓN.
// Necesario porque la página de acceso se prerenderiza: si leyéramos la
// variable allí, quedaría fijada durante el build (donde no existe).
// La site key es pública por diseño (viaja en el HTML de cualquier sitio
// con Turnstile) y está atada al dominio; el secreto nunca sale del servidor.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { siteKey: process.env.TURNSTILE_SITE_KEY ?? null },
    { headers: { "Cache-Control": "no-store" } }
  );
}
