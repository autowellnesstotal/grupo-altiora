"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { savePropertyImage } from "@/lib/uploads";
import { CATALOG_TAG, slugify } from "@/lib/catalog";
import {
  agentPolicy,
  audit,
  canDeleteProperty,
  canEditProperty,
  canPublishProperty,
} from "@/lib/permissions";

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
  const { session, role } = await requireRole("agente", "admin");
  const userId = session.user.id;

  const parsed = propertySchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const data = parsed.data;

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
    // Control de sabotaje: solo el dueño (según política) o el admin editan
    if (!canEditProperty(role, userId, existing)) {
      await audit(userId, "property.update.denegado", existing.clave);
      return { ok: false, message: "No tienes permiso para editar esta propiedad." };
    }
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
    await audit(userId, "property.update", existing.clave);
  } else {
    const clave = await uniqueClave();
    await prisma.property.create({
      data: {
        ...data,
        precio: data.precio ?? null,
        avaluo: data.avaluo ?? null,
        clave,
        slug: `${slugify(data.tipo)}-${slugify(data.ubicacion)}-${clave.toLowerCase()}`,
        hue: Math.floor(Math.random() * 360),
        createdById: userId,
        images: { create: saved.map((s, i) => ({ ...s, order: i })) },
      },
    });
    await audit(userId, "property.create", clave, data.ubicacion);
  }

  invalidatePublic();
  revalidatePath("/portal/inventario");
  redirect(`/portal/inventario?ok=1`);
}

export async function setPropertyStatus(formData: FormData) {
  const { session, role } = await requireRole("agente", "admin");
  const userId = session.user.id;
  const id = z.string().cuid().parse(formData.get("id"));
  const status = z.enum(["BORRADOR", "PUBLICADA"]).parse(formData.get("status"));

  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) return;
  if (!canPublishProperty(role, userId, existing)) {
    await audit(userId, "property.status.denegado", existing.clave, status);
    return;
  }

  await prisma.property.update({ where: { id }, data: { status } });
  await audit(
    userId,
    status === "PUBLICADA" ? "property.publish" : "property.unpublish",
    existing.clave
  );
  invalidatePublic();
  revalidatePath("/portal/inventario");
}

export async function deleteProperty(formData: FormData) {
  const { session, role } = await requireRole("agente", "admin");
  const userId = session.user.id;
  const id = z.string().cuid().parse(formData.get("id"));

  const existing = await prisma.property.findUnique({ where: { id } });
  if (!existing) return;
  if (!canDeleteProperty(role, userId, existing)) {
    await audit(userId, "property.delete.denegado", existing.clave);
    return;
  }

  await prisma.property.delete({ where: { id } });
  await audit(userId, "property.delete", existing.clave, existing.ubicacion);
  invalidatePublic();
  revalidatePath("/portal/inventario");
}

/** Capacidades del usuario actual sobre cada propiedad (para pintar la UI). */
export async function getPropertyCapabilities() {
  const { session, role } = await requireRole("agente", "admin");
  return { userId: session.user.id, role, policy: agentPolicy() };
}
