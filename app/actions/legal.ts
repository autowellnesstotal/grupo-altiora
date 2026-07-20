"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { audit } from "@/lib/permissions";
import type { ActionState } from "./properties";

const emptyToUndef = z.literal("").transform(() => undefined);

const caseSchema = z.object({
  expediente: z.string().trim().min(1).max(60),
  juzgado: z.string().trim().min(1).max(120),
  ciudad: z.string().trim().min(1).max(80),
  etapa: z.enum(["ACTIVO", "PAGADO", "PENDIENTE", "ARCHIVADO"]),
  estatus: z.string().trim().max(600).optional().or(emptyToUndef),
  demandado: z.string().trim().min(1).max(200),
  domicilio: z.string().trim().max(400).optional().or(emptyToUndef),
  montoAdeudado: z.coerce.number().positive().max(999_000_000).optional().or(emptyToUndef),
  interesPct: z.coerce.number().min(0).max(100).optional().or(emptyToUndef),
  fechaSuscripcion: z.string().trim().optional().or(emptyToUndef),
});

export async function upsertCase(
  caseId: string | null,
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { session } = await requireRole("legal", "admin");

  const parsed = caseSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }
  const d = parsed.data;
  const data = {
    expediente: d.expediente,
    juzgado: d.juzgado,
    ciudad: d.ciudad,
    etapa: d.etapa,
    estatus: d.estatus ?? null,
    demandado: d.demandado,
    domicilio: d.domicilio ?? null,
    montoAdeudado: d.montoAdeudado ?? null,
    interesPct: d.interesPct ?? null,
    fechaSuscripcion: d.fechaSuscripcion ? new Date(d.fechaSuscripcion) : null,
  };

  let id = caseId;
  if (id) {
    const existing = await prisma.legalCase.findUnique({ where: { id } });
    if (!existing) return { ok: false, message: "Expediente no encontrado." };
    await prisma.legalCase.update({ where: { id }, data });
    await audit(session.user.id, "case.update", d.expediente, d.demandado);
  } else {
    const created = await prisma.legalCase.create({
      data: { ...data, createdById: session.user.id },
    });
    id = created.id;
    await audit(session.user.id, "case.create", d.expediente, d.demandado);
  }

  revalidatePath("/portal/expedientes");
  redirect(`/portal/expedientes/${id}`);
}

export async function addCaseUpdate(formData: FormData) {
  const { session } = await requireRole("legal", "admin");
  const caseId = z.string().cuid().parse(formData.get("caseId"));
  const texto = z.string().trim().min(1).max(2000).parse(formData.get("texto"));
  const c = await prisma.legalCase.findUnique({ where: { id: caseId } });
  if (!c) return;
  await prisma.caseUpdate.create({ data: { caseId, texto, autorId: session.user.id } });
  // La bitácora es el historial operativo; el estatus visible se actualiza junto
  await prisma.legalCase.update({ where: { id: caseId }, data: { estatus: texto } });
  await audit(session.user.id, "case.nota", c.expediente);
  revalidatePath(`/portal/expedientes/${caseId}`);
}

export async function setCaseEtapa(formData: FormData) {
  const { session } = await requireRole("legal", "admin");
  const caseId = z.string().cuid().parse(formData.get("caseId"));
  const etapa = z.enum(["ACTIVO", "PAGADO", "PENDIENTE", "ARCHIVADO"]).parse(formData.get("etapa"));
  const c = await prisma.legalCase.findUnique({ where: { id: caseId } });
  if (!c) return;
  await prisma.legalCase.update({ where: { id: caseId }, data: { etapa } });
  await audit(session.user.id, "case.etapa", c.expediente, etapa);
  revalidatePath(`/portal/expedientes/${caseId}`);
  revalidatePath("/portal/expedientes");
}

const oficioSchema = z.object({
  caseId: z.string().cuid(),
  numero: z.string().trim().min(1).max(80),
  dependencia: z.string().trim().min(1).max(240),
  estatus: z.string().trim().max(300).optional().or(emptyToUndef),
  observaciones: z.string().trim().max(1000).optional().or(emptyToUndef),
  domicilioIngresado: z.string().trim().max(400).optional().or(emptyToUndef),
  domicilioArrojado: z.string().trim().max(400).optional().or(emptyToUndef),
  revisiones: z.string().trim().max(1000).optional().or(emptyToUndef),
});

export async function addOficio(formData: FormData) {
  const { session } = await requireRole("legal", "admin");
  const parsed = oficioSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;
  const { caseId, ...rest } = parsed.data;
  const c = await prisma.legalCase.findUnique({ where: { id: caseId } });
  if (!c) return;
  await prisma.oficio.create({ data: { caseId, ...rest } });
  await audit(session.user.id, "oficio.create", c.expediente, rest.numero);
  revalidatePath(`/portal/expedientes/${caseId}`);
}

const exhortoSchema = z.object({
  caseId: z.string().cuid(),
  numero: z.string().trim().max(80).optional().or(emptyToUndef),
  juzgadoDestino: z.string().trim().max(160).optional().or(emptyToUndef),
  estatus: z.string().trim().max(300).optional().or(emptyToUndef),
  seguimiento: z.string().trim().max(1000).optional().or(emptyToUndef),
});

export async function addExhorto(formData: FormData) {
  const { session } = await requireRole("legal", "admin");
  const parsed = exhortoSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;
  const { caseId, ...rest } = parsed.data;
  const c = await prisma.legalCase.findUnique({ where: { id: caseId } });
  if (!c) return;
  await prisma.exhorto.create({ data: { caseId, ...rest } });
  await audit(session.user.id, "exhorto.create", c.expediente, rest.numero);
  revalidatePath(`/portal/expedientes/${caseId}`);
}
