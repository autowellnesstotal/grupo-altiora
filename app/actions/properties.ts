"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { savePropertyImage } from "@/lib/uploads";
import { CATALOG_TAG, slugify } from "@/lib/catalog";

const propertySchema = z.object({
  tipo: z.enum(["Casa sola", "Departamento", "Casa en condominio", "Terreno", "Local comercial"]),
  categoria: z.enum(["ADJUDICADO", "CESION"]),
  ubicacion: z.string().trim().min(3).max(160),
  estado: z.string().trim().min(2).max(60),
  precio: z.coerce.number().positive().max(999_000_000).optional().or(z.literal("").transform(() => undefined)),
  avaluo: z.coerce.number().positive().max(999_000_000).optional().or(z.literal("").transform(() => undefined)),
  precioOculto: z.coerce.boolean().default(false),
  descripcion: z.string().trim().max(2000).optional(),
});

export type ActionState = { ok: boolean; message?: string } | null;

async function uniqueClave(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const clave = `ALT-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}`;
    const exists = await prisma.property.findUnique({ where: { clave } });
    if (!exists) return clave;
  }
  throw new Error("No se pudo generar una clave única.");
}

function invalidatePublic() {
  revalidateTag(CATALOG_TAG);
  revalidatePath("/", "layout");
}

export async function upsertProperty(
  propertyId: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { session } = await requireRole("agente", "admin");

  const parsed = propertySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

  // Fotos (opcionales): validadas y re-encodeadas por sharp
  const files = formData
    .getAll("fotos")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, 8);

  let saved;
  try {
    saved = await Promise.all(files.map((f) => savePropertyImage(f)));
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al procesar imágenes." };
  }

  let id = propertyId;
  if (id) {
    const existing = await prisma.property.findUnique({ where: { id } });
    if (!existing) return { ok: false, message: "Propiedad no encontrada." };
    await prisma.property.update({
      where: { id },
      data: {
        ...data,
        precio: data.precio ?? null,
        avaluo: data.avaluo ?? null,
        images: saved.length
          ? { create: saved.map((s, i) => ({ ...s, order: 100 + i })) }
          : undefined,
      },
    });
  } else {
    const clave = await uniqueClave();
    const created = await prisma.property.create({
      data: {
        ...data,
        precio: data.precio ?? null,
        avaluo: data.avaluo ?? null,
        clave,
        slug: `${slugify(data.tipo)}-${slugify(data.ubicacion)}-${clave.toLowerCase()}`,
        hue: Math.floor(Math.random() * 360),
        createdById: session.user.id,
        images: { create: saved.map((s, i) => ({ ...s, order: i })) },
      },
    });
    id = created.id;
  }

  invalidatePublic();
  revalidatePath("/portal/inventario");
  redirect(`/portal/inventario?ok=1`);
}

export async function setPropertyStatus(formData: FormData) {
  await requireRole("agente", "admin");
  const id = z.string().cuid().parse(formData.get("id"));
  const status = z.enum(["BORRADOR", "PUBLICADA"]).parse(formData.get("status"));
  await prisma.property.update({ where: { id }, data: { status } });
  invalidatePublic();
  revalidatePath("/portal/inventario");
}

export async function deleteProperty(formData: FormData) {
  await requireRole("agente", "admin");
  const id = z.string().cuid().parse(formData.get("id"));
  await prisma.property.delete({ where: { id } });
  invalidatePublic();
  revalidatePath("/portal/inventario");
}
