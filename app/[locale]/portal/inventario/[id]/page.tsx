import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { canEditProperty } from "@/lib/permissions";
import { PropertyForm } from "@/components/PropertyForm";
import { AdminPhotos } from "@/components/AdminPhotos";

export const dynamic = "force-dynamic";

export default async function EditarPropiedadPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const { session, role } = await requireRole("agente", "admin");

  const property = await prisma.property.findUnique({
    where: { id },
    include: { images: { orderBy: { order: "asc" } } },
  });
  if (!property) notFound();
  // Antisabotaje: solo el dueño (según política) o el admin abren la edición
  if (!canEditProperty(role, session.user.id, property)) redirect("/portal/inventario");

  const [t, tc, tp] = await Promise.all([
    getTranslations("portal"),
    getTranslations("common"),
    getTranslations("property"),
  ]);

  return (
    <div>
      <h1 className="font-serif font-medium text-[30px]">
        {t("edit")} · <span className="font-mono text-gold text-2xl">{property.clave}</span>
      </h1>
      <p className="text-[15px] text-muted mt-2 mb-6">{t("add_sub")}</p>

      {property.images.length > 0 && (
        <AdminPhotos
          images={property.images.map((img) => ({
            id: img.id,
            cardPath: img.cardPath,
            width: img.width,
            height: img.height,
          }))}
          alt={`${property.tipo} — ${property.ubicacion}`}
          labels={{
            prev: tp("gal_prev"),
            next: tp("gal_next"),
            close: tp("gal_close"),
            zoom: tp("gal_zoom"),
          }}
        />
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
          m2Terreno: property.m2Terreno,
          m2Construccion: property.m2Construccion,
          recamaras: property.recamaras,
          banos: property.banos == null ? null : Number(property.banos),
          estacionamientos: property.estacionamientos,
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
          l_ficha: t("l_ficha"),
          l_m2t: t("l_m2t"),
          l_m2c: t("l_m2c"),
          l_rec: t("l_rec"),
          l_banos: t("l_banos"),
          l_estac: t("l_estac"),
          l_desc: t("l_desc"),
          publish: t("save_changes"),
          cancel: t("cancel"),
          adj: tc("adj"),
          ces: tc("ces"),
        }}
      />
    </div>
  );
}
