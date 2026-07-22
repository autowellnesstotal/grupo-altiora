import "server-only";

/**
 * Cifras de la portada. Una sola regla:
 *
 *   La variable de entorno manda.
 *   Si está vacía  → manda el dato en vivo (base de datos).
 *   Si no hay dato en vivo → el mosaico no se muestra.
 *
 * Así el sitio dice la verdad por defecto, pero se puede fijar un número a mano
 * desde Easypanel sin recompilar (reinicio del servicio, ~30 s).
 *
 * | Variable                   | Vacía                        | Con valor      |
 * |----------------------------|------------------------------|----------------|
 * | ALTIORA_STAT_PROPIEDADES   | propiedades publicadas        | manda el valor |
 * | ALTIORA_STAT_ESTADOS       | estados distintos del catálogo| manda el valor |
 * | ALTIORA_STAT_ANIOS         | oculto (no hay fuente en vivo)| se muestra     |
 * | ALTIORA_STAT_INMUEBLES     | oculto (no hay fuente en vivo)| se muestra     |
 *
 * OJO: las variables se leen DENTRO de la función y con acceso estático. Si se
 * leyeran al importar el módulo, el valor podría quedar congelado en el build
 * —la misma trampa que obligó a mover la clave de Turnstile a /api/turnstile—.
 * El patrón correcto es el de `app/robots.ts`.
 *
 * Antes de abrir el sitio a buscadores hay que vaciar las cuatro variables.
 * Está en el checklist de lanzamiento de PENDIENTES.md.
 */

/** Normaliza un override: vacío, no numérico o negativo → null (se ignora). */
function leerOverride(valor: string | undefined): number | null {
  const crudo = valor?.trim();
  if (!crudo) return null;
  const n = Number(crudo);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.floor(n);
}

// Avisa una sola vez por arranque, no en cada visita.
let avisoEmitido = false;

function avisar(activos: string[]) {
  if (avisoEmitido || activos.length === 0) return;
  avisoEmitido = true;
  console.warn(
    `[altiora] Cifras manuales activas en la portada: ${activos.join(", ")}. ` +
      `Vaciar estas variables para volver a los datos en vivo.`
  );
}

export type CifraBarra = { valor: string; etiquetaKey: "tb_1" | "tb_2" | "tb_3" | "tb_4" };

export type CifrasPortada = {
  /** Número del recuadro dorado del hero. 0 = no renderizar el recuadro. */
  propiedadesActivas: number;
  /** true si el número viene de un override manual (entonces se muestra con "+"). */
  propiedadesManual: boolean;
  /** Mosaicos de la barra de confianza, ya filtrados: solo los que tienen dato. */
  barra: CifraBarra[];
};

/**
 * Resuelve las cifras a partir de las propiedades que la página ya cargó.
 * No hace ninguna consulta extra.
 */
export function cifrasPortada(publicadas: { estado: string }[]): CifrasPortada {
  const oPropiedades = leerOverride(process.env.ALTIORA_STAT_PROPIEDADES);
  const oEstados = leerOverride(process.env.ALTIORA_STAT_ESTADOS);
  const oAnios = leerOverride(process.env.ALTIORA_STAT_ANIOS);
  const oInmuebles = leerOverride(process.env.ALTIORA_STAT_INMUEBLES);

  const activos: string[] = [];
  if (oPropiedades !== null) activos.push(`ALTIORA_STAT_PROPIEDADES=${oPropiedades}`);
  if (oEstados !== null) activos.push(`ALTIORA_STAT_ESTADOS=${oEstados}`);
  if (oAnios !== null) activos.push(`ALTIORA_STAT_ANIOS=${oAnios}`);
  if (oInmuebles !== null) activos.push(`ALTIORA_STAT_INMUEBLES=${oInmuebles}`);
  avisar(activos);

  const propiedadesActivas = oPropiedades ?? publicadas.length;
  const estadosCobertura = oEstados ?? new Set(publicadas.map((p) => p.estado)).size;

  const nf = new Intl.NumberFormat("es-MX");
  const barra: CifraBarra[] = [];
  // Años e inmuebles colocados no salen de la BD: sin variable, no se muestran.
  if (oAnios !== null) barra.push({ valor: nf.format(oAnios), etiquetaKey: "tb_1" });
  if (oInmuebles !== null) barra.push({ valor: `+${nf.format(oInmuebles)}`, etiquetaKey: "tb_2" });
  if (estadosCobertura > 0) barra.push({ valor: nf.format(estadosCobertura), etiquetaKey: "tb_3" });
  // "100% con servicios legales" no es una estadística: es el modelo de negocio
  // (toda operación lleva blindaje incluido). Va fijo y sin variable.
  barra.push({ valor: "100%", etiquetaKey: "tb_4" });

  return {
    propiedadesActivas,
    propiedadesManual: oPropiedades !== null,
    barra,
  };
}

/** Clases literales: Tailwind no ve las construidas por concatenación. */
export function columnasBarra(n: number): string {
  switch (n) {
    case 1:
      return "lg:grid-cols-1";
    case 2:
      return "lg:grid-cols-2";
    case 3:
      return "lg:grid-cols-3";
    default:
      return "lg:grid-cols-4";
  }
}
