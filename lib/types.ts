/** Forma serializable de una propiedad para componentes (Decimal → number). */
export type PropertyCardData = {
  id: string;
  clave: string;
  slug: string;
  tipo: string;
  categoria: "ADJUDICADO" | "CESION";
  ubicacion: string;
  estado: string;
  precio: number | null;
  avaluo: number | null;
  precioOculto: boolean;
  hue: number;
  m2Terreno: number | null;
  m2Construccion: number | null;
  recamaras: number | null;
  banos: number | null;
  estacionamientos: number | null;
  image: { cardPath: string; width: number; height: number } | null;
};

export function toCardData(p: {
  id: string;
  clave: string;
  slug: string;
  tipo: string;
  categoria: "ADJUDICADO" | "CESION";
  ubicacion: string;
  estado: string;
  precio: unknown;
  avaluo: unknown;
  precioOculto: boolean;
  hue: number;
  m2Terreno?: number | null;
  m2Construccion?: number | null;
  recamaras?: number | null;
  banos?: unknown;
  estacionamientos?: number | null;
  images?: { cardPath: string; width: number; height: number }[];
}): PropertyCardData {
  return {
    id: p.id,
    clave: p.clave,
    slug: p.slug,
    tipo: p.tipo,
    categoria: p.categoria,
    ubicacion: p.ubicacion,
    estado: p.estado,
    precio: p.precio == null ? null : Number(p.precio),
    avaluo: p.avaluo == null ? null : Number(p.avaluo),
    precioOculto: p.precioOculto,
    hue: p.hue,
    m2Terreno: p.m2Terreno ?? null,
    m2Construccion: p.m2Construccion ?? null,
    recamaras: p.recamaras ?? null,
    banos: p.banos == null ? null : Number(p.banos),
    estacionamientos: p.estacionamientos ?? null,
    image: p.images?.[0]
      ? { cardPath: p.images[0].cardPath, width: p.images[0].width, height: p.images[0].height }
      : null,
  };
}
