import { NextRequest, NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { resolveUploadPath } from "@/lib/uploads";
import { auth } from "@/lib/auth";

/**
 * Sirve archivos del volumen de uploads.
 * - img/**  (fotos WebP de propiedades publicadas): público, cache immutable
 * - docs/** (PDFs de la Bóveda): SOLO autenticado
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: parts } = await params;
  const relative = parts.join("/");

  if (relative.startsWith("docs/")) {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session) return new NextResponse("No autorizado", { status: 401 });
  } else if (!relative.startsWith("img/")) {
    return new NextResponse("No encontrado", { status: 404 });
  }

  try {
    const abs = resolveUploadPath(relative);
    const data = await readFile(abs);
    const isPdf = relative.endsWith(".pdf");
    const isDocx = relative.endsWith(".docx");
    const isPrivate = relative.startsWith("docs/");
    const contentType = isPdf
      ? "application/pdf"
      : isDocx
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : "image/webp";
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": isPrivate
        ? "private, no-store"
        : "public, max-age=31536000, immutable",
    };
    // Los .docx se descargan; imágenes y PDF se muestran en línea
    headers["Content-Disposition"] = isDocx
      ? `attachment; filename="${relative.split("/").pop()}"`
      : "inline";
    return new NextResponse(new Uint8Array(data), { headers });
  } catch {
    return new NextResponse("No encontrado", { status: 404 });
  }
}
