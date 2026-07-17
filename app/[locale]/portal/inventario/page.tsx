import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { formatMXN } from "@/lib/catalog";
import { setPropertyStatus, deleteProperty } from "@/app/actions/properties";

export const dynamic = "force-dynamic";

export default async function InventarioPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("agente", "admin");
  const [t, tc] = await Promise.all([getTranslations("portal"), getTranslations("common")]);

  const properties = await prisma.property.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="font-serif font-medium text-[30px]">{t("inv")}</h1>
        <Link
          href="/portal/inventario/nueva"
          className="bg-gold hover:bg-gold2 text-navy font-semibold text-[13px] px-5 py-2.5 rounded-full"
        >
          ＋ {t("car")}
        </Link>
      </div>

      <div className="bg-surface border border-line2 rounded-xl overflow-hidden mt-5 overflow-x-auto">
        <table className="w-full text-[13px] min-w-[760px]">
          <thead>
            <tr className="bg-surface2 text-[11px] tracking-[0.08em] uppercase text-muted text-left">
              <th className="px-4 py-3.5 font-normal">{t("th_id")}</th>
              <th className="px-4 py-3.5 font-normal">{t("th_tipo")}</th>
              <th className="px-4 py-3.5 font-normal">{t("th_cat")}</th>
              <th className="px-4 py-3.5 font-normal">{t("th_ubic")}</th>
              <th className="px-4 py-3.5 font-normal">{t("th_precio")}</th>
              <th className="px-4 py-3.5 font-normal">{t("th_est")}</th>
              <th className="px-4 py-3.5 font-normal" />
            </tr>
          </thead>
          <tbody>
            {properties.map((p) => (
              <tr key={p.id} className="border-t border-line2 align-middle">
                <td className="px-4 py-3.5 font-mono text-gold">
                  <Link href={`/portal/inventario/${p.id}`} className="hover:underline">
                    {p.clave}
                  </Link>
                </td>
                <td className="px-4 py-3.5">{p.tipo}</td>
                <td className="px-4 py-3.5 text-muted">
                  {p.categoria === "ADJUDICADO" ? tc("adj") : tc("ces")}
                </td>
                <td className="px-4 py-3.5 text-muted">{p.ubicacion}</td>
                <td className="px-4 py-3.5">
                  {p.precioOculto || p.precio == null ? "—" : formatMXN(p.precio)}
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`text-[10px] px-2.5 py-1 rounded-full uppercase tracking-[0.05em] ${
                      p.status === "PUBLICADA"
                        ? "bg-[rgba(31,138,91,0.16)] text-[#4ade80]"
                        : "bg-line2 text-muted"
                    }`}
                  >
                    {p.status === "PUBLICADA" ? t("pub") : t("draft")}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2 justify-end">
                    <form action={setPropertyStatus}>
                      <input type="hidden" name="id" value={p.id} />
                      <input
                        type="hidden"
                        name="status"
                        value={p.status === "PUBLICADA" ? "BORRADOR" : "PUBLICADA"}
                      />
                      <button className="border border-line text-muted hover:border-gold hover:text-gold text-[11px] px-3 py-1.5 rounded-full">
                        {p.status === "PUBLICADA" ? t("unpublish") : t("publish")}
                      </button>
                    </form>
                    <form action={deleteProperty}>
                      <input type="hidden" name="id" value={p.id} />
                      <button className="border border-line text-muted hover:border-red-400 hover:text-red-400 text-[11px] px-3 py-1.5 rounded-full">
                        {t("delete")}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
