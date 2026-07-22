import "server-only";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

export const CATALOG_TAG = "catalogo";

const fetchPublishedProperties = unstable_cache(
  async () =>
    // OJO: sin try/catch aquí a propósito. Si la BD no responde (build de
    // Docker), esto LANZA y unstable_cache no guarda nada. Si atrapáramos el
    // error dentro, el `[]` del build quedaría cacheado y envenenaría el
    // catálogo en producción hasta que expirara el revalidate (1 h).
    prisma.property.findMany({
      where: { status: "PUBLICADA" },
      orderBy: { createdAt: "desc" },
      include: { images: { orderBy: { order: "asc" }, take: 1 } },
    }),
  ["published-properties"],
  { tags: [CATALOG_TAG], revalidate: 3600 }
);

/** Propiedades publicadas, cacheadas con tag (se invalida al publicar). */
export async function getPublishedProperties() {
  try {
    return await fetchPublishedProperties();
  } catch {
    // BD no disponible: catálogo vacío SIN cachear, se resuelve en el
    // siguiente request cuando la BD ya está accesible.
    return [];
  }
}

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
