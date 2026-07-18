import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireRole } from "@/lib/session";
import { PropertyForm } from "@/components/PropertyForm";

export const dynamic = "force-dynamic";

export default async function NuevaPropiedadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireRole("agente", "admin");
  const [t, tc] = await Promise.all([getTranslations("portal"), getTranslations("common")]);

  return (
    <div>
      <h1 className="font-serif font-medium text-[30px]">{t("add")}</h1>
      <p className="text-[15px] text-muted mt-2 mb-6">{t("add_sub")}</p>
      <PropertyForm
        propertyId={null}
        labels={{
          l_tipo: t("l_tipo"),
          l_cat: t("l_cat"),
          l_ubic: t("l_ubic"),
          l_est: t("l_est"),
          l_precio: t("l_precio"),
          l_avaluo: t("l_avaluo"),
          l_precio_consultar: t("l_precio_consultar"),
          l_fotos: t("l_fotos"),
          l_drop: t("l_drop"),
          l_ficha: t("l_ficha"),
          l_m2t: t("l_m2t"),
          l_m2c: t("l_m2c"),
          l_rec: t("l_rec"),
          l_banos: t("l_banos"),
          l_estac: t("l_estac"),
          l_desc: t("l_desc"),
          publish: t("save_draft"),
          cancel: t("cancel"),
          adj: tc("adj"),
          ces: tc("ces"),
        }}
      />
    </div>
  );
}
