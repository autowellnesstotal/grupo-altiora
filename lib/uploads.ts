import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import sharp from "sharp";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
const MAX_PDF_BYTES = 15 * 1024 * 1024; // 15 MB

export function uploadsDir() {
  return path.resolve(process.env.UPLOADS_DIR || "./uploads");
}

function randomName() {
  return crypto.randomBytes(12).toString("hex");
}

/**
 * Guarda una imagen de propiedad de forma segura:
 * - valida tamaño y que sea imagen real (sharp la decodifica o falla)
 * - RE-ENCODEA a WebP (elimina metadatos y cualquier payload embebido)
 * - genera variantes 640w (card) y 1280w (detalle)
 */
export async function savePropertyImage(file: File) {
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Imagen inválida o demasiado grande (máx. 8 MB).");
  }
  const input = Buffer.from(await file.arrayBuffer());

  const base = sharp(input, { failOn: "error" }).rotate();
  const meta = await base.metadata();
  if (!meta.width || !meta.height) throw new Error("El archivo no es una imagen válida.");

  const name = randomName();
  const dir = path.join(uploadsDir(), "img");
  await mkdir(dir, { recursive: true });

  const large = await base
    .clone()
    .resize({ width: 1280, withoutEnlargement: true })
    .webp({ quality: 78 })
    .toBuffer({ resolveWithObject: true });
  const card = await base
    .clone()
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 74 })
    .toBuffer({ resolveWithObject: true });

  await writeFile(path.join(dir, `${name}-1280.webp`), large.data);
  await writeFile(path.join(dir, `${name}-640.webp`), card.data);

  return {
    cardPath: `img/${name}-640.webp`,
    largePath: `img/${name}-1280.webp`,
    width: large.info.width,
    height: large.info.height,
  };
}

/** Guarda un PDF de la Bóveda validando el magic number %PDF. */
export async function saveDocumentPdf(file: File) {
  if (file.size === 0 || file.size > MAX_PDF_BYTES) {
    throw new Error("PDF inválido o demasiado grande (máx. 15 MB).");
  }
  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.subarray(0, 5).toString("latin1") !== "%PDF-") {
    throw new Error("El archivo no es un PDF válido.");
  }
  const name = `${randomName()}.pdf`;
  const dir = path.join(uploadsDir(), "docs");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), buf);
  return { filePath: `docs/${name}`, sizeBytes: buf.length };
}

/** Resuelve una ruta relativa dentro de UPLOADS_DIR impidiendo path traversal. */
export function resolveUploadPath(relative: string) {
  const root = uploadsDir();
  const resolved = path.resolve(root, relative);
  if (!resolved.startsWith(root + path.sep) && resolved !== root) {
    throw new Error("Ruta inválida.");
  }
  return resolved;
}
