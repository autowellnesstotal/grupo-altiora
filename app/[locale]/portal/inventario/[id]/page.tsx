import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PropertyForm } from "@/components/PropertyForm";

export const dynamic = "force-dynamic";

export default async function EditarPropiedadPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireRole("agente", "admin");

  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!property) notFound();

  const [t, tc] = await Promise.all([getTranslations("portal"), getTranslations("common")]);

  return (
    <div>
      <h1 className="font-serif font-medium text-[30px]">
        {t("edit")} · <span className="font-mono text-gold text-2xl">{property.clave}</span>
      </h1>
      <p className="text-[15px] text-muted mt-2 mb-6">{t("add_sub")}</p>

      {property.images.length > 0 && (
        <div className="flex gap-3 mb-6 flex-wrap">
          {property.images.map((img) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.id}
              src={`/api/uploads/${img.cardPath}`}
              alt=""
              width={128}
              height={Math.round((128 * img.height) / img.width)}
              loading="lazy"
              className="w-32 rounded-lg border border-line2 object-cover"
            />
          ))}
        </div>
      )}

      <PropertyForm
        propertyId={property.id}
        defaults={{
          tipo: property.tipo,
          categoria: property.categoria,
          ubicacion: property.ubicacion,
          estado: property.estado,
          precio: property.precio == null ? null : Number(property.precio),
          avaluo: property.avaluo == null ? null : Number(property.avaluo),
          precioOculto: property.precioOculto,
          descripcion: property.descripcion,
        }}
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
          publish: t("save_changes"),
          cancel: t("cancel"),
          adj: tc("adj"),
          ces: tc("ces"),
        }}
      />
    </div>
  );
}
