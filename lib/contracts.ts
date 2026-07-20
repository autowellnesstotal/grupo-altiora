import "server-only";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { createReport } from "docx-templates";
import { uploadsDir } from "./uploads";
import { pesosALetra, pesosFormato } from "./pesos";

export type ContractInput = {
  arrendador1: string;
  arrendador2?: string;
  arrendatario: string;
  arrendatario_nacionalidad: string;
  arrendatario_telefono: string;
  fiador?: string;
  fiador_nacionalidad?: string;
  fiador_telefono?: string;
  inmueble: string;
  escritura?: string;
  uso: string;
  renta: number;
  deposito: number;
  banco: string;
  cuenta: string;
  clabe: string;
  titular: string;
  plazo_meses: number;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_firma: string;
  lugar_firma: string;
  domicilio_notif?: string;
  email_notif?: string;
};

const TEMPLATE = "arrendamiento-v1.docx";

function templatePath() {
  return path.join(uploadsDir(), "templates", TEMPLATE);
}

/** Construye el objeto de datos completo que espera la plantilla (27 campos). */
function buildData(input: ContractInput): Record<string, string> {
  const arrendadores = input.arrendador2
    ? `LOS SRES. ${input.arrendador1} Y ${input.arrendador2}`
    : input.arrendador1;
  // Si no hay fiador aparte, el arrendatario funge como su propio obligado solidario
  const fiador = input.fiador?.trim() || input.arrendatario;
  return {
    arrendadores,
    arrendador1: input.arrendador1,
    arrendador2: input.arrendador2 ?? "",
    arrendatario: input.arrendatario,
    arrendatario_nacionalidad: input.arrendatario_nacionalidad,
    arrendatario_telefono: input.arrendatario_telefono,
    fiador,
    fiador_nacionalidad: input.fiador_nacionalidad?.trim() || input.arrendatario_nacionalidad,
    fiador_telefono: input.fiador_telefono?.trim() || input.arrendatario_telefono,
    inmueble: input.inmueble,
    escritura: input.escritura?.trim() || "que obra en poder de las partes",
    uso: input.uso,
    renta: pesosFormato(input.renta),
    renta_letra: pesosALetra(input.renta),
    deposito: pesosFormato(input.deposito),
    deposito_letra: pesosALetra(input.deposito),
    banco: input.banco,
    cuenta: input.cuenta,
    clabe: input.clabe,
    titular: input.titular,
    plazo_meses: String(input.plazo_meses),
    fecha_inicio: input.fecha_inicio,
    fecha_fin: input.fecha_fin,
    fecha_firma: input.fecha_firma,
    lugar_firma: input.lugar_firma,
    arrendador_domicilio_notif: input.domicilio_notif?.trim() || input.inmueble,
    email_notif: input.email_notif?.trim() || "",
  };
}

/**
 * Genera el contrato: DOCX siempre; PDF si GOTENBERG_URL está configurado.
 * Devuelve rutas relativas al volumen (bajo docs/ para quedar tras autenticación).
 */
export async function generateArrendamiento(
  input: ContractInput
): Promise<{ docxPath: string; pdfPath: string | null }> {
  const template = await readFile(templatePath());
  const report = await createReport({
    template,
    data: buildData(input),
    cmdDelimiter: ["{{", "}}"],
    failFast: true,
  });

  const dir = path.join(uploadsDir(), "docs", "contracts");
  await mkdir(dir, { recursive: true });
  const base = `arrendamiento-${crypto.randomBytes(8).toString("hex")}`;
  const docxRel = `docs/contracts/${base}.docx`;
  await writeFile(path.join(uploadsDir(), docxRel), report);

  let pdfRel: string | null = null;
  const gotenberg = process.env.GOTENBERG_URL;
  if (gotenberg) {
    try {
      const form = new FormData();
      form.append(
        "files",
        new Blob([new Uint8Array(report)], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        }),
        `${base}.docx`
      );
      const res = await fetch(`${gotenberg.replace(/\/$/, "")}/forms/libreoffice/convert`, {
        method: "POST",
        body: form,
      });
      if (res.ok) {
        const pdf = Buffer.from(await res.arrayBuffer());
        pdfRel = `docs/contracts/${base}.pdf`;
        await writeFile(path.join(uploadsDir(), pdfRel), pdf);
      }
    } catch {
      // Gotenberg caído → entregamos solo DOCX (degradación limpia)
      pdfRel = null;
    }
  }

  return { docxPath: docxRel, pdfPath: pdfRel };
}
