"use server";

import { revalidatePath } from "next/cache";
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { audit } from "@/lib/permissions";
import { uploadsDir } from "@/lib/uploads";
import { generateArrendamiento } from "@/lib/contracts";

export type ContractState =
  | { ok: true; docxPath: string; pdfPath: string | null }
  | { ok: false; message: string }
  | null;

const num = z.coerce.number().positive().max(999_000_000);

const schema = z.object({
  arrendador1: z.string().trim().min(2).max(160),
  arrendador2: z.string().trim().max(160).optional(),
  arrendatario: z.string().trim().min(2).max(160),
  arrendatario_nacionalidad: z.string().trim().min(2).max(40),
  arrendatario_telefono: z.string().trim().min(6).max(30),
  fiador: z.string().trim().max(160).optional(),
  fiador_nacionalidad: z.string().trim().max(40).optional(),
  fiador_telefono: z.string().trim().max(30).optional(),
  inmueble: z.string().trim().min(10).max(600),
  escritura: z.string().trim().max(300).optional(),
  uso: z.string().trim().min(3).max(80),
  renta: num,
  deposito: num,
  banco: z.string().trim().min(2).max(60),
  cuenta: z.string().trim().min(4).max(40),
  clabe: z.string().trim().min(6).max(40),
  titular: z.string().trim().min(2).max(160),
  plazo_meses: z.coerce.number().int().min(1).max(120),
  fecha_inicio: z.string().trim().min(4).max(40),
  fecha_fin: z.string().trim().min(4).max(40),
  fecha_firma: z.string().trim().min(4).max(40),
  lugar_firma: z.string().trim().min(3).max(120),
  domicilio_notif: z.string().trim().max(600).optional(),
  email_notif: z.string().trim().max(160).optional(),
});

export async function generateContract(
  _prev: ContractState,
  formData: FormData
): Promise<ContractState> {
  const { session } = await requireRole("legal", "admin");

  // La plantilla vive en el volumen (nunca en el repo). Si no está, avisamos claro.
  const tpl = path.join(uploadsDir(), "templates", "arrendamiento-v1.docx");
  if (!existsSync(tpl)) {
    return { ok: false, message: "PLANTILLA_FALTANTE" };
  }

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  let out;
  try {
    out = await generateArrendamiento(parsed.data);
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Error al generar el contrato." };
  }

  await prisma.generatedContract.create({
    data: {
      tipo: "ARRENDAMIENTO",
      // Guardamos solo datos no sensibles para el historial (partes y fechas)
      datos: {
        arrendatario: parsed.data.arrendatario,
        arrendador1: parsed.data.arrendador1,
        inmueble: parsed.data.inmueble.slice(0, 120),
        fecha_inicio: parsed.data.fecha_inicio,
      },
      docxPath: out.docxPath,
      pdfPath: out.pdfPath,
      createdById: session.user.id,
    },
  });
  await audit(session.user.id, "contrato.generar", "ARRENDAMIENTO", parsed.data.arrendatario);
  revalidatePath("/portal/contratos");

  return { ok: true, docxPath: out.docxPath, pdfPath: out.pdfPath };
}
