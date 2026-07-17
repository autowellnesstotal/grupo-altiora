import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 3600;

export async function generateMetadata() {
  const t = await getTranslations("about");
  return { title: t("s1_t") };
}

function SectionHead({ id, title }: { id: string; title: string }) {
  return (
    <div id={id} className="scroll-mt-28">
      <h2 className="font-serif font-medium text-[clamp(26px,3.5vw,36px)]">{title}</h2>
    </div>
  );
}

export default async function NosotrosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");

  const pilares = [
    ["◷", t("p1_t"), t("p1_d")],
    ["◈", t("p2_t"), t("p2_d")],
    ["✦", t("p3_t"), t("p3_d")],
    ["◱", t("p4_t"), t("p4_d")],
    ["❈", t("p5_t"), t("p5_d")],
  ] as const;

  return (
    <>
      <section className="bg-[radial-gradient(900px_400px_at_80%_-20%,rgba(200,162,74,0.10),transparent_60%),var(--color-surface2)] border-b border-line2">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-8 pt-12 pb-9">
          <h1 className="font-serif font-medium text-[clamp(32px,5vw,46px)]">{t("title")}</h1>
          <p className="text-base text-muted mt-3 max-w-[640px]">{t("sub")}</p>
        </div>
      </section>

      <div className="max-w-[1080px] mx-auto px-4 sm:px-8">
        {/* Conócenos */}
        <section className="py-14 border-b border-line2">
          <SectionHead id="conocenos" title={t("s1_t")} />
          <div className="grid md:grid-cols-2 gap-8 mt-6 text-[15px] leading-[1.75] text-muted">
            <p>{t("s1_p1")}</p>
            <p className="border-l-[3px] border-gold pl-5">{t("s1_p2")}</p>
          </div>
        </section>

        {/* Pilares */}
        <section className="py-14 border-b border-line2">
          <SectionHead id="pilares" title={t("s2_t")} />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
            {pilares.map(([icon, title, desc]) => (
              <div key={title} className="bg-surface border border-line2 rounded-2xl p-6">
                <div className="w-11 h-11 rounded-full border border-gold text-gold flex items-center justify-center text-lg">
                  {icon}
                </div>
                <h3 className="font-serif text-xl mt-4">{title}</h3>
                <p className="text-sm leading-[1.65] text-muted mt-2">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Filosofía */}
        <section className="py-14 border-b border-line2">
          <SectionHead id="filosofia" title={t("s3_t")} />
          <div className="grid md:grid-cols-2 gap-4 mt-7">
            <div className="bg-surface border border-line2 rounded-2xl p-6">
              <h3 className="font-serif text-xl text-ivory">{t("mision_t")}</h3>
              <p className="text-[15px] leading-[1.7] text-ivory mt-3">{t("mision")}</p>
            </div>
            <div className="bg-surface border border-line2 rounded-2xl p-6">
              <h3 className="font-serif text-xl text-ivory">{t("vision_t")}</h3>
              <p className="text-[15px] leading-[1.7] text-ivory mt-3">{t("vision")}</p>
            </div>
          </div>
          <p className="font-serif italic text-[clamp(19px,2.5vw,24px)] text-gold leading-[1.5] max-w-[760px] mx-auto text-center mt-10">
            {t("manifiesto")}
          </p>
          <div className="max-w-[680px] mx-auto text-center mt-10 border-t border-line2 pt-8">
            <p className="font-serif italic text-lg text-ivory">{t("proverbio")}</p>
            <p className="text-[13px] text-muted mt-3 leading-[1.7]">{t("proverbio_src")}</p>
          </div>
        </section>

        {/* Cobertura */}
        <section className="py-14 border-b border-line2">
          <SectionHead id="cobertura" title={t("s4_t")} />
          <div className="flex flex-wrap items-center gap-8 mt-6">
            <div className="font-serif text-[64px] text-gold leading-none">18</div>
            <p className="text-[15px] leading-[1.75] text-muted max-w-[560px]">{t("s4_p1")}</p>
          </div>
        </section>

        {/* Responsabilidad */}
        <section className="py-14 border-b border-line2">
          <SectionHead id="responsabilidad" title={t("s5_t")} />
          <p className="text-[15px] leading-[1.75] text-muted mt-6 max-w-[720px]">{t("s5_p1")}</p>
        </section>

        {/* Ética */}
        <section className="py-14 pb-20">
          <SectionHead id="etica" title={t("s6_t")} />
          <ul className="grid sm:grid-cols-2 gap-3.5 mt-7">
            {[t("e1"), t("e2"), t("e3"), t("e4"), t("e5"), t("e6")].map((e) => (
              <li
                key={e}
                className="flex gap-3 bg-surface border border-line2 rounded-xl px-5 py-4 text-sm leading-[1.6] text-muted"
              >
                <span className="text-gold">⚖</span> {e}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
