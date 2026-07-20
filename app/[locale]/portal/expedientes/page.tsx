import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { formatMXN } from "@/lib/catalog";
import type { Prisma, CaseEtapa } from "@prisma/client";

export const dynamic = "force-dynamic";

const ETAPAS = ["ACTIVO", "PENDIENTE", "PAGADO", "ARCHIVADO"] as const;

const etapaBadge: Record<string, string> = {
  ACTIVO: "bg-gold/10 text-gold",
  PENDIENTE: "bg-sky-500/10 text-sky-400",
  PAGADO: "bg-emerald-500/10 text-emerald-400",
  ARCHIVADO: "bg-muted/10 text-muted",
};

export default async function ExpedientesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ etapa?: string; q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("legal", "admin");
  const t = await getTranslations("portal");

  const { etapa, q } = await searchParams;
  const where: Prisma.LegalCaseWhereInput = {};
  if (etapa && (ETAPAS as readonly string[]).includes(etapa)) {
    where.etapa = etapa as CaseEtapa;
  }
  if (q && q.trim()) {
    where.OR = [
      { demandado: { contains: q.trim(), mode: "insensitive" } },
      { expediente: { contains: q.trim(), mode: "insensitive" } },
      { juzgado: { contains: q.trim(), mode: "insensitive" } },
    ];
  }

  const cases = await prisma.legalCase.findMany({
    where,
    orderBy: [{ etapa: "asc" }, { updatedAt: "desc" }],
    take: 300,
  });

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif font-medium text-[30px]">{t("ex_t")}</h1>
          <p className="text-[15px] text-muted mt-2">⚖ {t("ex_s")}</p>
        </div>
        <Link
          href="/portal/expedientes/nuevo"
          className="bg-gold hover:bg-gold2 text-navy font-semibold text-sm px-6 py-2.5 rounded-full whitespace-nowrap"
        >
          {t("ex_nuevo")}
        </Link>
      </div>

      {/* Filtros por GET: cero JS de cliente */}
      <form method="get" className="flex gap-3 flex-wrap mt-6 mb-5">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("ex_buscar")}
          className="bg-surface2 border border-line2 focus:border-gold outline-none rounded-lg px-3.5 py-2.5 text-sm text-ivory w-72 max-w-full"
        />
        <select
          name="etapa"
          defaultValue={etapa ?? ""}
          className="bg-surface2 border border-line2 rounded-lg px-3 py-2.5 text-sm text-ivory"
        >
          <option value="">{t("ex_todas")}</option>
          {ETAPAS.map((e) => (
            <option key={e} value={e}>
              {t(`et_${e}`)}
            </option>
          ))}
        </select>
        <button className="border border-gold text-gold hover:bg-gold hover:text-navy text-sm px-5 py-2.5 rounded-full transition">
          →
        </button>
      </form>

      {cases.length === 0 ? (
        <p className="text-muted py-10">{t("ex_vacio")}</p>
      ) : (
        <div className="bg-surface border border-line2 rounded-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-[13px] min-w-[820px]">
            <thead>
              <tr className="bg-surface2 text-[11px] tracking-[0.08em] uppercase text-muted text-left">
                <th className="px-4 py-3">{t("ex_th_exp")}</th>
                <th className="px-4 py-3">{t("ex_th_juz")}</th>
                <th className="px-4 py-3">{t("ex_th_ciudad")}</th>
                <th className="px-4 py-3">{t("ex_th_dem")}</th>
                <th className="px-4 py-3">{t("ex_th_etapa")}</th>
                <th className="px-4 py-3">{t("ex_th_estatus")}</th>
                <th className="px-4 py-3 text-right">{t("ex_th_monto")}</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id} className="border-t border-line2 hover:bg-surface2/60">
                  <td className="px-4 py-3 font-mono text-gold whitespace-nowrap">
                    <Link href={`/portal/expedientes/${c.id}`} className="hover:underline">
                      {c.expediente}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{c.juzgado}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{c.ciudad}</td>
                  <td className="px-4 py-3">{c.demandado}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-[0.05em] ${etapaBadge[c.etapa]}`}
                    >
                      {t(`et_${c.etapa}`)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted max-w-[260px] truncate">{c.estatus}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {c.montoAdeudado != null ? formatMXN(Number(c.montoAdeudado)) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
