"use client";

import { useCallback, useEffect, useState } from "react";

export type LightboxImage = { src: string; alt: string };

export type LightboxLabels = { prev: string; next: string; close: string; zoom: string };

/**
 * Lightbox de pantalla completa con zoom 2× al clic (origen en el cursor).
 * Esc / clic fuera cierran; flechas ← → navegan; bloquea el scroll del body.
 */
export function ImageLightbox({
  images,
  index,
  onClose,
  onIndex,
  labels,
}: {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
  labels: LightboxLabels;
}) {
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const many = images.length > 1;

  const go = useCallback(
    (delta: number) => {
      setZoom(null);
      onIndex((index + delta + images.length) % images.length);
    },
    [index, images.length, onIndex]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && many) go(-1);
      else if (e.key === "ArrowRight" && many) go(1);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [go, many, onClose]);

  const img = images[index];
  if (!img) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={img.alt}
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center"
      onClick={onClose}
    >
      {/* Imagen: clic alterna zoom 2× centrado en el cursor */}
      <img
        src={img.src}
        alt={img.alt}
        title={labels.zoom}
        onClick={(e) => {
          e.stopPropagation();
          if (zoom) {
            setZoom(null);
          } else {
            const r = (e.target as HTMLElement).getBoundingClientRect();
            setZoom({
              x: ((e.clientX - r.left) / r.width) * 100,
              y: ((e.clientY - r.top) / r.height) * 100,
            });
          }
        }}
        className={`max-w-[94vw] max-h-[92vh] object-contain select-none transition-transform duration-200 ${
          zoom ? "cursor-zoom-out" : "cursor-zoom-in"
        }`}
        style={
          zoom
            ? { transform: "scale(2)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
            : undefined
        }
        draggable={false}
      />

      <button
        type="button"
        aria-label={labels.close}
        onClick={onClose}
        className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/60 text-white text-xl hover:bg-gold hover:text-navy transition"
      >
        ✕
      </button>

      {many && (
        <>
          <button
            type="button"
            aria-label={labels.prev}
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white text-2xl leading-none hover:bg-gold hover:text-navy transition"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label={labels.next}
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 text-white text-2xl leading-none hover:bg-gold hover:text-navy transition"
          >
            ›
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/85 text-sm font-mono bg-black/50 px-3 py-1 rounded-full">
            {index + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
