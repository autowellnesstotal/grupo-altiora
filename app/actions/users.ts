"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { audit } from "@/lib/permissions";
import type { ActionState } from "./properties";

const createUserSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(12).max(128),
  role: z.enum(["admin", "agente", "inversionista", "legal"]),
});

export async function createPortalUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole("admin");

  const parsed = createUserSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      message:
        issue?.path[0] === "password"
          ? "La contraseña debe tener al menos 12 caracteres."
          : issue?.message ?? "Datos inválidos.",
    };
  }

  try {
    await auth.api.createUser({
      body: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        // better-auth tipa role como "user"|"admin"; en runtime acepta roles custom
        role: parsed.data.role as "admin",
      },
      headers: await headers(),
    });
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "No se pudo crear el usuario.",
    };
  }

  const { session } = await requireRole("admin");
  await audit(session.user.id, "user.create", parsed.data.email, parsed.data.role);
  revalidatePath("/portal/admin/usuarios");
  return { ok: true };
}

/**
 * Borra una cuenta SOLO si no arrastra información con ella.
 * Bloquea si tiene estados de cuenta o mensajes (se perderían en cascada),
 * si es la propia cuenta, o si es el último administrador.
 * Lo que sí sobrevive al borrado (propiedades, expedientes, contratos, auditoría)
 * no impide la operación: esos registros quedan sin autor, no se destruyen.
 */
export async function deletePortalUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const { session } = await requireRole("admin");
  const userId = z.string().min(8).parse(formData.get("userId"));

  if (userId === session.user.id) {
    return { ok: false, message: "No puedes borrar tu propia cuenta." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, role: true },
  });
  if (!target) return { ok: false, message: "La cuenta ya no existe." };

  if (target.role === "admin") {
    const admins = await prisma.user.count({ where: { role: "admin" } });
    if (admins <= 1) {
      return { ok: false, message: "No puedes borrar al único administrador." };
    }
  }

  // Datos que se destruirían en cascada → mejor dar de baja
  const [statements, messages, threads] = await Promise.all([
    prisma.statement.count({ where: { userId } }),
    prisma.message.count({ where: { authorId: userId } }),
    prisma.messageThread.count({ where: { userId } }),
  ]);
  if (statements > 0 || messages > 0 || threads > 0) {
    const partes: string[] = [];
    if (statements > 0) partes.push(`${statements} estado(s) de cuenta`);
    if (messages > 0) partes.push(`${messages} mensaje(s)`);
    if (threads > 0 && messages === 0) partes.push("una conversación");
    return {
      ok: false,
      message: `No se borró: esta cuenta tiene ${partes.join(" y ")} que se perderían. Usa "Dar de baja" para bloquear el acceso conservando la información.`,
    };
  }

  await prisma.user.delete({ where: { id: userId } });
  await audit(session.user.id, "user.delete", target.email, target.role);
  revalidatePath("/portal/admin/usuarios");
  return { ok: true };
}

export async function setUserBanned(formData: FormData) {
  const { session } = await requireRole("admin");
  const userId = z.string().min(8).parse(formData.get("userId"));
  const banned = formData.get("banned") === "true";
  const h = await headers();
  if (banned) {
    await auth.api.banUser({ body: { userId }, headers: h });
  } else {
    await auth.api.unbanUser({ body: { userId }, headers: h });
  }
  await audit(session.user.id, banned ? "user.ban" : "user.unban", userId);
  revalidatePath("/portal/admin/usuarios");
}
