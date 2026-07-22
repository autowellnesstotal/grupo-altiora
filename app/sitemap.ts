import type { MetadataRoute } from "next";
import { getPublishedProperties } from "@/lib/catalog";

const BASE = "https://grupoaltiora.cloud";

// Dinámico: el build de Docker no alcanza la BD, así que un sitemap estático
// quedaría congelado sin propiedades (ver AVANCE 2026-07-21).
export const dynamic = "force-dynamic";

/** URL de una ruta en cada idioma. `es` es el locale por defecto (sin prefijo). */
function alternates(path: string) {
  return {
    languages: {
      es: `${BASE}${path}`,
      en: `${BASE}/en${path === "/" ? "" : path}`,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths: { path: string; priority: number; freq: "daily" | "weekly" | "monthly" }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/catalogo", priority: 0.9, freq: "daily" },
    { path: "/nosotros", priority: 0.7, freq: "monthly" },
    { path: "/servicios", priority: 0.7, freq: "monthly" },
    { path: "/acceso", priority: 0.4, freq: "monthly" },
    { path: "/aviso-de-privacidad", priority: 0.2, freq: "monthly" },
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map(({ path, priority, freq }) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: freq,
    priority,
    alternates: alternates(path),
  }));

  // Una entrada por propiedad publicada (misma consulta cacheada del catálogo)
  const properties = await getPublishedProperties();
  for (const p of properties) {
    const path = `/propiedad/${p.slug}`;
    entries.push({
      url: `${BASE}${path}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: alternates(path),
    });
  }

  return entries;
}
