import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export type Role = "admin" | "agente" | "inversionista";

export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

/** Exige sesión; si no hay, redirige al login. */
export async function requireUser() {
  const session = await getSession();
  if (!session) redirect("/acceso");
  return session;
}

/**
 * Exige uno de los roles dados. SIEMPRE llamar en server actions y páginas
 * sensibles — nunca confiar en el cliente ni solo en el middleware.
 */
export async function requireRole(...roles: Role[]) {
  const session = await requireUser();
  const role = (session.user as { role?: string }).role as Role | undefined;
  if (!role || !roles.includes(role)) redirect("/portal");
  return { session, role };
}

export function userRole(session: { user: { role?: string | null } }): Role {
  return ((session.user.role as Role) ?? "inversionista");
}
