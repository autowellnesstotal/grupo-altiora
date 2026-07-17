import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export const revalidate = 3600;

export async function generateMetadata() {
  const t = await getTranslations("services");
  return { title: t("s1_t") };
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs tracking-[0.28em] uppercase text-gold font-medium">{children}</div>
  );
}

function SectionHead({ id, title, sub }: { id: string; title: string; sub: string }) {
  return (
    <div id={id} className="scroll-mt-28">
      <Eyebrow>{sub}</Eyebrow>
      <h2 className="font-serif font-medium text-[clamp(26px,3.5vw,36px)] mt-2.5">{title}</h2>
    </div>
  );
}

export default async function ServiciosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("services");

  return (
    <>
      <section className="bg-[radial-gradient(900px_400px_at_80%_-20%,rgba(200,162,74,0.10),transparent_60%),var(--color-surface2)] border-b border-line2">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-8 pt-12 pb-9">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="font-serif font-medium text-[clamp(32px,5vw,46px)] mt-3.5">{t("title")}</h1>
          <p className="text-base text-muted mt-3 max-w-[640px]">{t("sub")}</p>
        </div>
      </section>

      <div className="max-w-[1080px] mx-auto px-4 sm:px-8">
        {/* Servicios integrales */}
        <section className="py-14 border-b border-line2">
          <SectionHead id="integrales" title={t("s1_t")} sub={t("s1_st")} />
          <p className="text-[15px] leading-[1.75] text-muted mt-6 max-w-[720px]">{t("s1_p1")}</p>
          <div className="grid gap-3 mt-7 max-w-[760px]">
            {[t("b1"), t("b2"), t("b3"), t("b4"), t("b5")].map((b, i) => (
              <div
                key={b}
                className="flex gap-4 items-start bg-surface border border-line2 rounded-xl px-5 py-4"
              >
                <span className="font-serif text-xl text-gold leading-none mt-0.5">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="text-sm leading-[1.65] text-ivory">{b}</p>
              </div>
            ))}
          </div>
          <Link
            href="/catalogo"
            className="inline-block mt-8 bg-gold hover:bg-gold2 text-navy font-semibold text-sm px-7 py-3 rounded-full"
          >
            {t("s1_cta")}
          </Link>
        </section>

        {/* Certificaciones */}
        <section className="py-14 border-b border-line2">
          <SectionHead id="certificaciones" title={t("s2_t")} sub={t("s2_st")} />
          <p className="text-[15px] leading-[1.75] text-muted mt-6 max-w-[720px]">{t("s2_p1")}</p>
        </section>

        {/* Calificaciones */}
        <section className="py-14 border-b border-line2">
          <SectionHead id="calificaciones" title={t("s3_t")} sub={t("s3_st")} />
          <p className="text-[15px] leading-[1.75] text-muted mt-6 max-w-[720px]">{t("s3_p1")}</p>
        </section>

        {/* Tecnología */}
        <section className="py-14 pb-20">
          <SectionHead id="tecnologia" title={t("s4_t")} sub={t("s4_st")} />
          <p className="text-[15px] leading-[1.75] text-muted mt-6 max-w-[720px]">{t("s4_p1")}</p>
          <div className="grid sm:grid-cols-2 gap-4 mt-7 max-w-[860px]">
            {(
              [
                ["◱", t("t1")],
                ["⧉", t("t2")],
                ["◉", t("t3")],
                ["✦", t("t4")],
              ] as const
            ).map(([icon, desc]) => (
              <div key={desc} className="flex gap-4 bg-surface border border-line2 rounded-xl px-5 py-4">
                <span className="text-gold text-xl">{icon}</span>
                <p className="text-sm leading-[1.65] text-muted">{desc}</p>
              </div>
            ))}
          </div>
          <Link
            href="/acceso"
            className="inline-block mt-8 border border-gold text-gold hover:bg-gold hover:text-navy text-sm px-7 py-3 rounded-full transition"
          >
            {t("s4_cta")}
          </Link>
        </section>
      </div>
    </>
  );
}
