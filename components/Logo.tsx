/**
 * Marca "A" de Altiora, vectorizada del logo oficial (logo.png) midiendo su
 * geometría: chevron con muesca interior + barra transversal suelta.
 * ViewBox 139×149 = proporción real del original.
 *
 * Va en SVG (no PNG) para: escalar nítido en cualquier tamaño y densidad,
 * pesar ~300 bytes sin petición extra, y no arrastrar el fondo azul del PNG
 * (que en modo claro se vería como una calcomanía).
 */
export function LogoMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={Math.round(size * (139 / 149))}
      height={size}
      viewBox="0 0 139 149"
      fill="#C8A24A"
      className={className}
      aria-hidden="true"
    >
      <path d="M69.5 0 L139 139 H112.8 L69.5 55 L26.2 139 H0 Z" />
      <path d="M49 140 H90 V149 H49 Z" />
    </svg>
  );
}

/**
 * Lockup horizontal: filete — marca ALTIORA — filete, como el logo oficial.
 * El wordmark va como texto vivo (Cormorant, la misma tipografía del logo):
 * se adapta al tema claro/oscuro y es seleccionable.
 */
export function LogoLockup({ size = 26 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-4">
      <span className="h-px w-10 sm:w-16 bg-gold/70" aria-hidden="true" />
      <span className="inline-flex items-center gap-3">
        <LogoMark size={size} />
        <span
          className="font-serif tracking-[0.16em] text-ivory"
          style={{ fontSize: size * 0.85 }}
        >
          ALTIORA
        </span>
      </span>
      <span className="h-px w-10 sm:w-16 bg-gold/70" aria-hidden="true" />
    </span>
  );
}
