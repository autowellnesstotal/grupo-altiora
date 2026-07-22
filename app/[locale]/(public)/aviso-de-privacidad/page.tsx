import { setRequestLocale } from "next-intl/server";

export const metadata = { title: "Aviso de privacidad" };

export default async function AvisoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section className="max-w-[820px] mx-auto px-4 sm:px-8 py-14">
      <h1 className="font-serif font-medium text-[clamp(30px,4.5vw,42px)]">
        Aviso de privacidad
      </h1>
      <div className="mt-6 space-y-4 text-[16px] leading-[1.75] text-muted">
        <p>
          [Documento pendiente de redacción legal — LFPDPPP.] Grupo Altiora, con domicilio en
          Ciudad de México, es responsable del tratamiento de los datos personales que se recaban
          a través de este sitio y del portal de acreditados.
        </p>
        <p>
          Los datos se utilizan únicamente para la gestión de su inversión, la operación del
          portal y la comunicación con su asesor. No se comparten con terceros sin su
          consentimiento, salvo obligación legal.
        </p>
        <p>
          Para ejercer sus derechos ARCO (acceso, rectificación, cancelación y oposición),
          escriba a contacto@altiora.mx.
        </p>
        <p className="text-xs">
          Este texto es un marcador de posición y debe ser sustituido por el aviso de privacidad
          definitivo elaborado por el área legal antes del lanzamiento con datos reales.
        </p>
      </div>
    </section>
  );
}
