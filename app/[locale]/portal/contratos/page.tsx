import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium" }).format(d);
}

export default async function ContratosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("legal", "admin");
  const t = await getTranslations("portal");

  const contratos = await prisma.generatedContract.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif font-medium text-[30px]">{t("co_t")}</h1>
          <p className="text-[15px] text-muted mt-2">✎ {t("co_s")}</p>
        </div>
        <Link
          href="/portal/contratos/nuevo"
          className="bg-gold hover:bg-gold2 text-navy font-semibold text-sm px-6 py-2.5 rounded-full whitespace-nowrap"
        >
          {t("co_nuevo")}
        </Link>
      </div>

      {contratos.length === 0 ? (
        <p className="text-muted py-10">{t("co_vacio")}</p>
      ) : (
        <div className="bg-surface border border-line2 rounded-xl overflow-hidden overflow-x-auto mt-6">
          <table className="w-full text-[13px] min-w-[640px]">
            <thead>
              <tr className="bg-surface2 text-[11px] tracking-[0.08em] uppercase text-muted text-left">
                <th className="px-4 py-3">{t("co_th_fecha")}</th>
                <th className="px-4 py-3">{t("co_th_tipo")}</th>
                <th className="px-4 py-3">{t("co_th_partes")}</th>
                <th className="px-4 py-3">{t("co_th_docs")}</th>
              </tr>
            </thead>
            <tbody>
              {contratos.map((c) => {
                const datos = (c.datos ?? {}) as { arrendatario?: string };
                return (
                  <tr key={c.id} className="border-t border-line2">
                    <td className="px-4 py-3 whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                    <td className="px-4 py-3">{c.tipo}</td>
                    <td className="px-4 py-3">{datos.arrendatario ?? "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-3">
                        <a href={`/api/uploads/${c.docxPath}`} className="text-gold hover:underline">
                          {t("co_docx")}
                        </a>
                        {c.pdfPath && (
                          <a
                            href={`/api/uploads/${c.pdfPath}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gold hover:underline"
                          >
                            {t("co_pdf")}
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
