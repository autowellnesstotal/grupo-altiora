import "server-only";
import { prisma } from "./prisma";
import type { Role } from "./session";

/**
 * Política de permisos de agentes, configurable por variables de entorno
 * (cambiar en Easypanel → web → Environment, sin tocar código):
 *
 *  PERM_AGENTE_EDIT    = "own" (default) | "all" | "none"
 *      own  → el agente solo edita las propiedades que él creó
 *      all  → puede editar cualquiera
 *      none → solo puede CARGAR propiedades nuevas (no editar existentes)
 *
 *  PERM_AGENTE_PUBLISH = "1" (default) | "0"
 *      1 → el agente publica/despublica lo suyo directamente
 *      0 → el agente solo guarda borradores; publicar queda en manos del admin
 *
 *  PERM_AGENTE_DELETE  = "drafts" (default) | "own" | "none"
 *      drafts → solo borra SUS borradores (lo publicado lo borra solo el admin)
 *      own    → borra cualquier propiedad suya (incluso publicada)
 *      none   → no puede borrar nada
 *
 * El ADMIN siempre puede todo. Las propiedades sin dueño (createdById null,
 * p. ej. las demo del seed) solo las gestiona el admin.
 */
export const agentPolicy = () => ({
  edit: (process.env.PERM_AGENTE_EDIT ?? "own") as "own" | "all" | "none",
  publish: (process.env.PERM_AGENTE_PUBLISH ?? "1") === "1",
  delete: (process.env.PERM_AGENTE_DELETE ?? "drafts") as "drafts" | "own" | "none",
});

type PropertyLike = { createdById: string | null; status: "BORRADOR" | "PUBLICADA" };

export function canEditProperty(role: Role, userId: string, p: PropertyLike) {
  if (role === "admin") return true;
  if (role !== "agente") return false;
  const policy = agentPolicy();
  if (policy.edit === "none") return false;
  if (policy.edit === "all") return true;
  return p.createdById === userId;
}

export function canPublishProperty(role: Role, userId: string, p: PropertyLike) {
  if (role === "admin") return true;
  if (role !== "agente") return false;
  if (!agentPolicy().publish) return false;
  // publicar exige además poder editar esa propiedad
  return canEditProperty(role, userId, p);
}

export function canDeleteProperty(role: Role, userId: string, p: PropertyLike) {
  if (role === "admin") return true;
  if (role !== "agente") return false;
  const policy = agentPolicy();
  if (policy.delete === "none") return false;
  if (p.createdById !== userId) return false;
  if (policy.delete === "drafts") return p.status === "BORRADOR";
  return true; // "own"
}

/** Registro de auditoría — toda acción sensible deja huella. Nunca rompe el flujo. */
export async function audit(
  userId: string | null,
  action: string,
  entity: string,
  detail?: string
) {
  try {
    await prisma.auditLog.create({ data: { userId, action, entity, detail } });
  } catch (e) {
    console.error("[audit] no se pudo registrar:", e);
  }
}
