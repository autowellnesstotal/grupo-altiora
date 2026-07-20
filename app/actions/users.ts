"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
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
