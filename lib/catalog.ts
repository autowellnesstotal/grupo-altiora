import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export const CATALOG_TAG = "catalogo";

/** Propiedades publicadas, cacheadas con tag (se invalida al publicar). */
export const getPublishedProperties = unstable_cache(
  async () => {
    try {
      return await prisma.property.findMany({
        where: { status: "PUBLICADA" },
        orderBy: { createdAt: "desc" },
        include: { images: { orderBy: { order: "asc" }, take: 1 } },
      });
    } catch {
      // BD no disponible (p. ej. durante el build de Docker): catálogo vacío,
      // se regenera al primer request en runtime.
      return [];
    }
  },
  ["published-properties"],
  { tags: [CATALOG_TAG], revalidate: 3600 }
);

export async function getPropertyBySlug(slug: string) {
  try {
    return await prisma.property.findFirst({
      where: { slug, status: "PUBLICADA" },
      include: { images: { orderBy: { order: "asc" } } },
    });
  } catch {
    return null;
  }
}

export function formatMXN(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
