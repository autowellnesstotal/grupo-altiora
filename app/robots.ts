import type { MetadataRoute } from "next";

const BASE = "https://grupoaltiora.cloud";

// Dinámico: si se generara en el build, `SITE_INDEXABLE` quedaría congelada
// y cambiarla en el panel no tendría efecto (misma trampa del catálogo).
export const dynamic = "force-dynamic";

/**
 * Un solo interruptor para abrir el sitio a buscadores el día del lanzamiento:
 *   SITE_INDEXABLE=1  → permite indexar y declara el sitemap
 *   (sin la variable) → bloquea todo (estado actual: datos de demostración)
 *
 * OJO: no basta con esto. Ver el checklist en PENDIENTES.md — también hay que
 * quitar `robots:{index:false}` del layout y la cabecera X-Robots-Tag.
 */
export default function robots(): MetadataRoute.Robots {
  // Se lee en cada petición, no al construir la imagen.
  const indexable = process.env.SITE_INDEXABLE === "1";
  return indexable
    ? {
        rules: [{ userAgent: "*", allow: "/", disallow: ["/portal/", "/api/"] }],
        sitemap: `${BASE}/sitemap.xml`,
        host: BASE,
      }
    : {
        // Prototipo con propiedades y cifras ficticias: fuera de buscadores.
        rules: [{ userAgent: "*", disallow: "/" }],
      };
}
