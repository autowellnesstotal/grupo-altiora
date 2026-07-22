"use client";

import { useState } from "react";
import { ImageLightbox, type LightboxLabels } from "./ImageLightbox";

type AdminImage = { id: string; cardPath: string; width: number; height: number };

/** Miniaturas de "Editar propiedad": clic → lightbox grande (1280w + zoom 2×). */
export function AdminPhotos({
  images,
  alt,
  labels,
}: {
  images: AdminImage[];
  alt: string;
  labels: LightboxLabels;
}) {
  const [open, setOpen] = useState<number | null>(null);

  const lightboxImages = images.map((img, i) => ({
    src: `/api/uploads/${img.cardPath.replace("-640.webp", "-1280.webp")}`,
    alt: `${alt} — ${i + 1}`,
  }));

  return (
    <>
      <div className="flex gap-3 mb-6 flex-wrap">
        {images.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.id}
            src={`/api/uploads/${img.cardPath}`}
            alt={`${alt} — ${i + 1}`}
            width={128}
            height={Math.round((128 * img.height) / img.width)}
            loading="lazy"
            title={labels.zoom}
            onClick={() => setOpen(i)}
            className="w-32 rounded-lg border border-line2 object-cover cursor-zoom-in hover:border-gold transition"
          />
        ))}
      </div>
      {open !== null && (
        <ImageLightbox
          images={lightboxImages}
          index={open}
          onIndex={setOpen}
          onClose={() => setOpen(null)}
          labels={labels}
        />
      )}
    </>
  );
}
