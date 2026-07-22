"use client";

import { useRef, useState } from "react";
import { ImageLightbox, type LightboxLabels } from "./ImageLightbox";

type GalleryImage = { cardPath: string; width: number; height: number };

const large = (p: string) => `/api/uploads/${p.replace("-640.webp", "-1280.webp")}`;
const thumb = (p: string) => `/api/uploads/${p}`;

/**
 * Carrusel del detalle de propiedad: imagen principal + flechas + contador +
 * tira de miniaturas. Clic en la imagen abre el lightbox (zoom 2×).
 * Teclado ← → y swipe táctil.
 */
export function PropertyGallery({
  images,
  alt,
  clave,
  tagLegal,
  labels,
}: {
  images: GalleryImage[];
  alt: string;
  clave: string;
  tagLegal: string;
  labels: LightboxLabels;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const touchX = useRef<number | null>(null);
  const many = images.length > 1;

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  const lightboxImages = images.map((img, i) => ({
    src: large(img.cardPath),
    alt: `${alt} — ${i + 1}`,
  }));

  return (
    <div>
      <div
        className="relative aspect-[16/10] overflow-hidden bg-[hsl(205_24%_14%)] group focus:outline-none"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" && many) go(-1);
          else if (e.key === "ArrowRight" && many) go(1);
          else if (e.key === "Enter") setOpen(true);
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current == null || !many) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 45) go(dx > 0 ? -1 : 1);
          touchX.current = null;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={large(images[index].cardPath)}
          alt={`${alt} — ${index + 1}`}
          width={images[index].width}
          height={images[index].height}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          onClick={() => setOpen(true)}
          title={labels.zoom}
          className="absolute inset-0 h-full w-full object-cover cursor-zoom-in"
        />

        {/* Badges (mismos del hero anterior) */}
        <span className="absolute top-3 right-3 bg-[rgba(31,138,91,0.92)] text-white text-[9px] tracking-[0.06em] px-2 py-1 rounded-full uppercase pointer-events-none">
          {tagLegal}
        </span>
        <span className="absolute top-3 left-3 bg-[rgba(8,21,29,0.8)] text-gold text-[10px] font-mono px-2 py-1 rounded-md pointer-events-none">
          {clave}
        </span>

        {many && (
          <>
            <button
              type="button"
              aria-label={labels.prev}
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 text-white text-xl leading-none hover:bg-gold hover:text-navy transition opacity-0 group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label={labels.next}
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/55 text-white text-xl leading-none hover:bg-gold hover:text-navy transition opacity-0 group-hover:opacity-100 focus:opacity-100 max-sm:opacity-100"
            >
              ›
            </button>
            <span className="absolute bottom-3 right-3 text-white/90 text-[11px] font-mono bg-black/55 px-2.5 py-1 rounded-full pointer-events-none">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {/* Tira de miniaturas */}
      {many && (
        <div className="flex gap-2 mt-2.5 overflow-x-auto pb-1">
          {images.map((img, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={img.cardPath}
              src={thumb(img.cardPath)}
              alt={`${alt} — ${i + 1}`}
              width={96}
              height={Math.round((96 * img.height) / img.width)}
              loading="lazy"
              decoding="async"
              onClick={() => setIndex(i)}
              className={`h-16 w-24 object-cover rounded-lg cursor-pointer border-2 transition shrink-0 ${
                i === index ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            />
          ))}
        </div>
      )}

      {open && (
        <ImageLightbox
          images={lightboxImages}
          index={index}
          onIndex={setIndex}
          onClose={() => setOpen(false)}
          labels={labels}
        />
      )}
    </div>
  );
}
