import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireRole } from "@/lib/session";
import { ContractForm } from "@/components/ContractForm";

export const dynamic = "force-dynamic";

export default async function NuevoContratoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("legal", "admin");
  const t = await getTranslations("portal");

  const L: Record<string, string> = {
    sec_arrendador: t("co_sec_arrendador"),
    sec_arrendatario: t("co_sec_arrendatario"),
    sec_fiador: t("co_sec_fiador"),
    sec_inmueble: t("co_sec_inmueble"),
    sec_economia: t("co_sec_economia"),
    sec_plazo: t("co_sec_plazo"),
    l_nombre: t("co_l_nombre"),
    l_nombre2: t("co_l_nombre2"),
    l_nac: t("co_l_nac"),
    l_tel: t("co_l_tel"),
    l_inmueble: t("co_l_inmueble"),
    l_uso: t("co_l_uso"),
    l_escritura: t("co_l_escritura"),
    l_renta: t("co_l_renta"),
    l_deposito: t("co_l_deposito"),
    l_banco: t("co_l_banco"),
    l_cuenta: t("co_l_cuenta"),
    l_clabe: t("co_l_clabe"),
    l_titular: t("co_l_titular"),
    l_meses: t("co_l_meses"),
    l_inicio: t("co_l_inicio"),
    l_fin: t("co_l_fin"),
    l_firma: t("co_l_firma"),
    l_lugar: t("co_l_lugar"),
    l_email: t("co_l_email"),
    generar: t("co_generar"),
    ok: t("co_ok"),
    docx: t("co_docx"),
    pdf: t("co_pdf"),
    sin_plantilla: t("co_sin_plantilla"),
  };

  return (
    <div>
      <Link href="/portal/contratos" className="text-[13px] text-muted hover:text-gold">
        ← {t("co_t")}
      </Link>
      <h1 className="font-serif font-medium text-[30px] mt-2">{t("co_form_t")}</h1>
      <p className="text-[15px] text-muted mt-2 mb-6 max-w-[680px]">{t("co_form_s")}</p>
      <ContractForm L={L} />
    </div>
  );
}
