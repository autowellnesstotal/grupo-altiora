import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { CreateUserForm } from "@/components/CreateUserForm";
import { setUserBanned } from "@/app/actions/users";

export const dynamic = "force-dynamic";

export default async function UsuariosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { session } = await requireRole("admin");
  const t = await getTranslations("portal");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, banned: true, createdAt: true },
  });

  const roleLabel = (r: string) =>
    r === "admin" ? t("role_admin") : r === "agente" ? t("role_agente") : t("role_inversionista");

  return (
    <div>
      <h1 className="font-serif font-medium text-[30px]">{t("adm_t")}</h1>
      <p className="text-[15px] text-muted mt-2 mb-6">{t("adm_s")}</p>

      <div className="mb-7">
        <CreateUserForm
          labels={{
            name: t("adm_name"),
            email: t("adm_email"),
            pass: t("adm_pass"),
            role: t("adm_role"),
            create: t("adm_new"),
            created: t("adm_created"),
            roles: {
              admin: t("role_admin"),
              agente: t("role_agente"),
              inversionista: t("role_inversionista"),
            },
          }}
        />
      </div>

      <div className="bg-surface border border-line2 rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-[13px] min-w-[640px]">
          <thead>
            <tr className="bg-surface2 text-[11px] tracking-[0.08em] uppercase text-muted text-left">
              <th className="px-4 py-3.5 font-normal">{t("adm_name")}</th>
              <th className="px-4 py-3.5 font-normal">{t("adm_email")}</th>
              <th className="px-4 py-3.5 font-normal">{t("adm_role")}</th>
              <th className="px-4 py-3.5 font-normal" />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-line2">
                <td className="px-4 py-3.5">{u.name}</td>
                <td className="px-4 py-3.5 text-muted">{u.email}</td>
                <td className="px-4 py-3.5">
                  <span className="text-[10px] px-2.5 py-1 rounded-full uppercase tracking-[0.05em] bg-gold/10 text-gold">
                    {roleLabel(u.role)}
                  </span>
                  {u.banned && (
                    <span className="ml-2 text-[10px] px-2.5 py-1 rounded-full uppercase bg-red-500/10 text-red-400">
                      baja
                    </span>
                  )}
                </td>
                <td className="px-4 py-3.5 text-right">
                  {u.id !== session.user.id && (
                    <form action={setUserBanned} className="inline">
                      <input type="hidden" name="userId" value={u.id} />
                      <input type="hidden" name="banned" value={u.banned ? "false" : "true"} />
                      <button
                        className={`border text-[11px] px-3 py-1.5 rounded-full ${
                          u.banned
                            ? "border-line text-muted hover:border-gold hover:text-gold"
                            : "border-line text-muted hover:border-red-400 hover:text-red-400"
                        }`}
                      >
                        {u.banned ? "Reactivar" : "Dar de baja"}
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
