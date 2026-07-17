"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { saveDocumentPdf } from "@/lib/uploads";
import { audit } from "@/lib/permissions";
import type { ActionState } from "./properties";

export async function uploadDocument(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { session } = await requireRole("agente", "admin");

  const propertyId = z.string().cuid().safeParse(formData.get("propertyId"));
  const title = z.string().trim().min(2).max(120).safeParse(formData.get("title"));
  const file = formData.get("file");

  if (!propertyId.success || !title.success || !(file instanceof File)) {
    return { ok: false, message: "Datos inválidos." };
  }
  const property = await prisma.property.findUnique({ where: { id: propertyId.data } });
  if (!property) return { ok: false, message: "Propiedad no encontrada." };

  try {
    const saved = await saveDocumentPdf(file);
    await prisma.document.create({
      data: { propertyId: propertyId.data, title: title.data, ...saved },
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al subir el PDF." };
  }

  await audit(session.user.id, "document.upload", property.clave, title.data);
  revalidatePath("/portal/boveda");
  return { ok: true };
}
