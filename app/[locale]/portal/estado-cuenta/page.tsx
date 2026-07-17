import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { formatMXN } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function EstadoCuentaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { session } = await requireRole("inversionista", "admin");
  const t = await getTranslations("portal");

  const statements = await prisma.statement.findMany({
    where: { userId: session.user.id },
    include: { lines: { orderBy: { fecha: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const fmtDate = new Intl.DateTimeFormat(locale === "en" ? "en-US" : "es-MX", {
    dateStyle: "medium",
  });

  return (
    <div>
      <h1 className="font-serif font-medium text-[30px]">{t("st_t")}</h1>
      <p className="text-[15px] text-muted mt-2 mb-6">{t("st_s")}</p>

      {statements.length === 0 ? (
        <p className="text-muted">{t("st_empty")}</p>
      ) : (
        <div className="grid gap-6 max-w-[820px]">
          {statements.map((s) => (
            <div key={s.id} className="bg-surface border border-line2 rounded-xl overflow-hidden">
              <div className="bg-surface2 border-b border-line2 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
                <span className="text-sm">{s.titulo}</span>
                <span className="text-sm text-muted">
                  {t("st_saldo")}:{" "}
                  <span className="font-serif text-xl text-gold">{formatMXN(Number(s.saldo))}</span>
                </span>
              </div>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-[11px] tracking-[0.08em] uppercase text-muted text-left">
                    <th className="px-5 py-3 font-normal">{t("st_fecha")}</th>
                    <th className="px-5 py-3 font-normal">{t("st_concepto")}</th>
                    <th className="px-5 py-3 font-normal text-right">{t("st_cargo")}</th>
                    <th className="px-5 py-3 font-normal text-right">{t("st_abono")}</th>
                  </tr>
                </thead>
                <tbody>
                  {s.lines.map((l) => (
                    <tr key={l.id} className="border-t border-line2">
                      <td className="px-5 py-3 text-muted">{fmtDate.format(l.fecha)}</td>
                      <td className="px-5 py-3">{l.concepto}</td>
                      <td className="px-5 py-3 text-right text-red-300">
                        {l.cargo != null ? formatMXN(Number(l.cargo)) : ""}
                      </td>
                      <td className="px-5 py-3 text-right text-[#4ade80]">
                        {l.abono != null ? formatMXN(Number(l.abono)) : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
