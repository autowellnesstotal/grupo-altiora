import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPropertyBySlug, getPublishedProperties } from "@/lib/catalog";
import { toCardData } from "@/lib/types";
import { PropertyPhoto, formatPriceMXN } from "@/components/PropertyCard";
import { routing } from "@/i18n/routing";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const props = await getPublishedProperties();
  return routing.locales.flatMap((locale) => props.map((p) => ({ locale, slug: p.slug })));
}

export default async function PropiedadPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const [t, tc, tcat] = await Promise.all([
    getTranslations("property"),
    getTranslations("common"),
    getTranslations("catalog"),
  ]);
  const p = toCardData(property);
  const catLabel = p.categoria === "ADJUDICADO" ? tc("adj") : tc("ces");

  return (
    <section className="max-w-[1080px] mx-auto px-4 sm:px-8 py-12">
      <Link href="/catalogo" className="text-[13px] text-muted hover:text-gold">
        ← {t("back")}
      </Link>

      <div className="grid lg:grid-cols-[1.15fr_.85fr] gap-9 mt-6 items-start">
        <div className="rounded-2xl overflow-hidden border border-line2">
          <PropertyPhoto
            p={p}
            labels={{ tagLegal: tc("tag_legal"), photoPh: tc("photo_ph") }}
            aspect="aspect-[16/10]"
            large
            priority
          />
        </div>

        <div>
          <div className="text-xs tracking-[0.2em] uppercase text-gold font-mono">{p.clave}</div>
          <h1 className="font-serif font-medium text-[clamp(30px,4vw,42px)] mt-2 leading-tight">
            {p.tipo}
          </h1>
          <p className="text-muted mt-1.5">{p.ubicacion}</p>

          <dl className="mt-7 grid gap-3.5 text-[15px]">
            {(
              [
                [t("category"), catLabel],
                [t("state"), p.estado],
                ...(p.m2Terreno != null ? [[t("land"), `${p.m2Terreno} m²`]] : []),
                ...(p.m2Construccion != null ? [[t("built"), `${p.m2Construccion} m²`]] : []),
                ...(p.recamaras != null ? [[t("beds"), String(p.recamaras)]] : []),
                ...(p.banos != null ? [[t("baths"), String(p.banos)]] : []),
                ...(p.estacionamientos != null
                  ? [[t("parking"), String(p.estacionamientos)]]
                  : []),
                [
                  t("appraisal"),
                  p.avaluo != null ? formatPriceMXN(p.avaluo) : "—",
                ],
              ] as [string, string][]
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 border-b border-line2 pb-3">
                <dt className="text-muted">{k}</dt>
                <dd className="text-ivory text-right">{v}</dd>
              </div>
            ))}
            <div className="flex justify-between gap-4 items-baseline pt-1">
              <dt className="text-muted">{t("price")}</dt>
              <dd className="font-serif text-[32px] text-gold">
                {p.precioOculto || p.precio == null ? tcat("consult") : formatPriceMXN(p.precio)}
              </dd>
            </div>
          </dl>

          {property.descripcion && (
            <p className="text-[15px] leading-[1.7] text-muted mt-6">{property.descripcion}</p>
          )}

          <div className="mt-8 border-l-[3px] border-gold bg-gold/[0.07] px-5 py-4 rounded-r-[10px]">
            <p className="text-sm leading-[1.6] text-ivory">{t("contact_note")}</p>
          </div>

          <a
            href={`mailto:contacto@altiora.mx?subject=${encodeURIComponent(`${t("interested")} · ${p.clave}`)}`}
            className="inline-block mt-6 bg-gold hover:bg-gold2 text-navy font-semibold text-[15px] px-8 py-3.5 rounded-full"
          >
            {t("interested")}
          </a>
        </div>
      </div>
    </section>
  );
}
