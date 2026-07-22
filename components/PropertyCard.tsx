import { Link } from "@/i18n/navigation";
import type { PropertyCardData } from "@/lib/types";

export function formatPriceMXN(n: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

export function PropertyPhoto({
  p,
  labels,
  aspect = "aspect-[16/10]",
  large = false,
  priority = false,
}: {
  p: PropertyCardData;
  labels: { tagLegal: string; photoPh: string };
  aspect?: string;
  large?: boolean;
  priority?: boolean;
}) {
  return (
    <div
      className={`relative ${aspect} flex items-center justify-center overflow-hidden photo-ph`}
      style={{ backgroundColor: `hsl(${p.hue} 24% 18%)` }}
    >
      {p.image ? (
        // Variantes WebP pre-generadas al subir: sin optimización en runtime (CPU) y peso mínimo
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/uploads/${large ? p.image.cardPath.replace("-640.webp", "-1280.webp") : p.image.cardPath}`}
          alt={`${p.tipo} — ${p.ubicacion}`}
          width={p.image.width}
          height={p.image.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="font-mono text-[10px] tracking-[0.1em] text-muted uppercase">
          {labels.photoPh}
        </span>
      )}
      <span className="absolute top-3 right-3 bg-[rgba(31,138,91,0.92)] text-white text-[9px] tracking-[0.06em] px-2 py-1 rounded-full uppercase">
        {labels.tagLegal}
      </span>
      <span className="absolute top-3 left-3 bg-[rgba(8,21,29,0.8)] text-gold text-[10px] font-mono px-2 py-1 rounded-md">
        {p.clave}
      </span>
    </div>
  );
}

export function PropertyCard({
  p,
  labels,
}: {
  p: PropertyCardData;
  labels: {
    tagLegal: string;
    photoPh: string;
    avaluo: string;
    ver: string;
    consult: string;
    catLabel: string;
    abRec: string;
    abBanos: string;
    abBano1: string;
  };
}) {
  // Línea de especificaciones estilo portal inmobiliario: "140 m² · 3 rec · 2.5 baños"
  const m2 = p.m2Construccion ?? p.m2Terreno;
  const specs = [
    m2 != null ? `${m2} m²` : null,
    p.recamaras != null ? `${p.recamaras} ${labels.abRec}` : null,
    p.banos != null ? `${p.banos} ${p.banos === 1 ? labels.abBano1 : labels.abBanos}` : null,
  ].filter(Boolean);

  return (
    <Link
      href={`/propiedad/${p.slug}`}
      className="block bg-surface border border-line2 rounded-[14px] overflow-hidden transition hover:border-gold hover:-translate-y-1"
    >
      <PropertyPhoto p={p} labels={labels} />
      <div className="p-4 pb-5">
        <div className="text-[18px] text-ivory">{p.tipo}</div>
        <div className="text-xs tracking-[0.06em] uppercase text-gold mt-1">{labels.catLabel}</div>
        <div className="text-[14px] text-muted mt-2">{p.ubicacion}</div>
        {specs.length > 0 && (
          <div className="text-[13px] text-ivory/85 mt-2">{specs.join(" · ")}</div>
        )}
        <div className="h-px bg-line2 my-3.5" />
        <div className="flex items-end justify-between gap-2">
          <div>
            {p.avaluo != null && (
              <div className="text-[11px] text-muted uppercase tracking-[0.08em]">
                {labels.avaluo}: {formatPriceMXN(p.avaluo)}
              </div>
            )}
            <div className="font-serif text-[26px] text-gold leading-tight">
              {p.precioOculto || p.precio == null ? labels.consult : formatPriceMXN(p.precio)}
            </div>
          </div>
          <span className="border border-line text-ivory text-xs px-3.5 py-2 rounded-full whitespace-nowrap">
            {labels.ver}
          </span>
        </div>
      </div>
    </Link>
  );
}
