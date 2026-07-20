import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireRole } from "@/lib/session";
import { CaseForm } from "@/components/CaseForm";

export const dynamic = "force-dynamic";

export default async function NuevoExpedientePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("legal", "admin");
  const t = await getTranslations("portal");

  return (
    <div>
      <h1 className="font-serif font-medium text-[30px]">{t("ex_nuevo").replace("＋ ", "")}</h1>
      <p className="text-[15px] text-muted mt-2 mb-6">{t("ex_s")}</p>
      <CaseForm
        caseId={null}
        labels={{
          exp: t("ex_l_exp"),
          juz: t("ex_l_juz"),
          ciudad: t("ex_l_ciudad"),
          etapa: t("ex_l_etapa"),
          estatus: t("ex_l_estatus"),
          dem: t("ex_l_dem"),
          dom: t("ex_l_dom"),
          monto: t("ex_l_monto"),
          interes: t("ex_l_interes"),
          fecha: t("ex_l_fecha"),
          guardar: t("ex_guardar"),
          etapas: {
            ACTIVO: t("et_ACTIVO"),
            PENDIENTE: t("et_PENDIENTE"),
            PAGADO: t("et_PAGADO"),
            ARCHIVADO: t("et_ARCHIVADO"),
          },
        }}
      />
    </div>
  );
}
