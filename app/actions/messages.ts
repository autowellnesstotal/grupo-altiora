"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser, userRole } from "@/lib/session";
import type { ActionState } from "./properties";

export async function sendMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await requireUser();
  const role = userRole(session);

  const body = z.string().trim().min(1).max(2000).safeParse(formData.get("body"));
  if (!body.success) return { ok: false, message: "Mensaje vacío o demasiado largo." };

  // El inversionista solo escribe en SU hilo; agente/admin pueden responder cualquiera.
  let threadUserId = session.user.id;
  const target = formData.get("threadUserId");
  if (typeof target === "string" && target && target !== session.user.id) {
    if (role !== "admin" && role !== "agente") {
      return { ok: false, message: "Sin permiso para este hilo." };
    }
    threadUserId = z.string().min(8).parse(target);
  }

  const thread = await prisma.messageThread.upsert({
    where: { userId: threadUserId },
    update: {},
    create: { userId: threadUserId },
  });

  await prisma.message.create({
    data: { threadId: thread.id, authorId: session.user.id, body: body.data },
  });

  revalidatePath("/portal/brujula");
  return { ok: true };
}
