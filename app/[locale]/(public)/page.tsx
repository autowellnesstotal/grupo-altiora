import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedProperties } from "@/lib/catalog";
import { toCardData } from "@/lib/types";
import { PropertyCard } from "@/components/PropertyCard";
import { LogoMark } from "@/components/Logo";

export const revalidate = 3600;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc, tcat] = await Promise.all([
    getTranslations("home"),
    getTranslations("common"),
    getTranslations("catalog"),
  ]);
  const properties = (await getPublishedProperties()).slice(0, 4).map(toCardData);

  const cardLabels = (categoria: "ADJUDICADO" | "CESION") => ({
    tagLegal: tc("tag_legal"),
    photoPh: tc("photo_ph"),
    avaluo: tcat("avaluo"),
    ver: tcat("ver"),
    consult: tcat("consult"),
    catLabel: categoria === "ADJUDICADO" ? tc("adj") : tc("ces"),
    abRec: tcat("ab_rec"),
    abBanos: tcat("ab_banos"),
    abBano1: tcat("ab_bano_1"),
  });

  return (
    <>
      {/* Hero */}
      <section className="relative bg-[radial-gradient(1100px_500px_at_78%_-10%,rgba(200,162,74,0.10),transparent_60%),linear-gradient(180deg,var(--color-navy),var(--color-surface2))]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-14 sm:pt-[70px] pb-10 grid lg:grid-cols-[1.05fr_.95fr] gap-10 lg:gap-[52px] items-center">
          <div>
            <h1 className="font-serif font-medium text-[clamp(34px,6vw,58px)] leading-[1.06] text-ivory text-balance">
              {t("title")}
            </h1>
            <p className="text-[17px] leading-[1.7] text-muted max-w-[520px] mt-5">{t("sub")}</p>
            <div className="flex gap-3.5 mt-7 flex-wrap">
              <Link
                href="/catalogo"
                className="bg-gold hover:bg-gold2 text-navy font-semibold text-[15px] px-7 py-3.5 rounded-full"
              >
                {t("cta1")}
              </Link>
              <Link
                href="/acceso"
                className="border border-line hover:border-gold hover:text-gold text-ivory text-[15px] px-7 py-3.5 rounded-full"
              >
                {t("cta2")}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl border border-line overflow-hidden photo-ph bg-surface flex items-center justify-center">
              <span className="font-mono text-xs tracking-[0.12em] text-muted uppercase">
                {t("img_render")}
              </span>
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gold text-navy px-5 py-3.5 rounded-xl shadow-2xl shadow-black/40">
              <div className="font-serif text-[30px] font-semibold leading-none">+180</div>
              <div className="text-[11px] tracking-[0.08em] mt-1">{t("img_stat")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Barra de confianza */}
      <section className="border-y border-line2 mt-8">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
          {[
            ["25", t("tb_1")],
            ["+1,200", t("tb_2")],
            ["18", t("tb_3")],
            ["100%", t("tb_4")],
          ].map(([n, label]) => (
            <div key={label}>
              <div className="font-serif text-[40px] text-gold leading-none">{n}</div>
              <div className="text-[13px] text-muted mt-2">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Inversión en bienes */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 sm:py-[78px]">
        <div className="text-center max-w-[640px] mx-auto">
          <h2 className="font-serif font-medium text-[clamp(30px,4.5vw,44px)] text-ivory">
            {t("inv_title")}
          </h2>
          <p className="text-base leading-[1.7] text-muted mt-4">{t("inv_sub")}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mt-11">
          {(
            [
              ["01", t("c1_t"), t("c1_d"), t("c1_bl"), t("c1_b"), "card-grad-a"],
              ["02", t("c2_t"), t("c2_d"), t("c2_bl"), t("c2_b"), "card-grad-b"],
            ] as const
          ).map(([num, title, desc, benefitLabel, benefit, grad]) => (
            <div key={num} className="bg-surface border border-line2 rounded-2xl overflow-hidden">
              <div className={`px-8 py-9 ${grad} border-b-2 border-gold`}>
                <div className="text-[11px] tracking-[0.2em] uppercase text-gold">{num}</div>
                <h3 className="font-serif font-semibold text-[30px] mt-2.5">{title}</h3>
              </div>
              <div className="px-8 pt-7 pb-8">
                <p className="text-[15px] leading-[1.7] text-muted">{desc}</p>
                <div className="mt-5 border-l-[3px] border-gold bg-gold/[0.07] px-4.5 py-4 rounded-r-[10px]">
                  <div className="text-xs tracking-[0.1em] uppercase text-gold font-semibold">
                    {benefitLabel}
                  </div>
                  <p className="text-sm leading-[1.6] text-ivory mt-2">{benefit}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/catalogo"
            className="inline-block border border-gold text-gold hover:bg-gold hover:text-navy text-[15px] px-8 py-3 rounded-full transition"
          >
            {t("inv_cta")}
          </Link>
        </div>
      </section>

      {/* Preview del catálogo (dinámico desde BD) */}
      <section className="bg-surface2 border-y border-line2">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16">
          <div className="flex items-end justify-between gap-6 flex-wrap">
            <div className="max-w-[620px]">
              <h2 className="font-serif font-medium text-[clamp(28px,4vw,40px)] text-ivory">
                {t("cat_title")}
              </h2>
              <p className="text-[15px] text-muted mt-3">{t("cat_sub")}</p>
            </div>
            <Link href="/catalogo" className="text-sm text-gold hover:text-gold2 whitespace-nowrap">
              {t("cat_cta")} →
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
            {properties.map((p) => (
              <PropertyCard key={p.id} p={p} labels={cardLabels(p.categoria)} />
            ))}
          </div>
        </div>
      </section>

      {/* Visión Periférica */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 sm:py-[82px]">
        <div className="text-center max-w-[660px] mx-auto">
          <h2 className="font-serif font-medium text-[clamp(30px,4.5vw,44px)]">
            {t("vp_title")}
          </h2>
          <p className="text-base leading-[1.7] text-muted mt-4">{t("vp_sub")}</p>
        </div>
        <div className="grid md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-3.5 items-center mt-12">
          {(
            [
              ["◱", t("vp_1t"), t("vp_1d"), false],
              ["→", "", "", null],
              ["◈", t("vp_2t"), t("vp_2d"), true],
              ["→", "", "", null],
              ["◵", t("vp_3t"), t("vp_3d"), false],
            ] as const
          ).map(([icon, title, desc, highlight], i) =>
            highlight === null ? (
              <div key={i} className="hidden md:block text-gold text-[22px] text-center">
                {icon}
              </div>
            ) : (
              <div
                key={i}
                className={`bg-surface rounded-2xl px-6 py-7 text-center border ${
                  highlight
                    ? "border-gold shadow-[0_0_0_4px_rgba(200,162,74,0.06)]"
                    : "border-line2"
                }`}
              >
                <div className="w-[52px] h-[52px] rounded-full border border-gold text-gold flex items-center justify-center text-[22px] mx-auto">
                  {icon}
                </div>
                <h3 className="font-serif text-2xl mt-4">{title}</h3>
                <p className="text-sm leading-[1.6] text-muted mt-2.5">{desc}</p>
              </div>
            )
          )}
        </div>
        <p className="text-center font-serif italic text-xl text-gold mt-9 max-w-[640px] mx-auto">
          {t("vp_note")}
        </p>
      </section>

      {/* Teaser del portal */}
      <section className="bg-gradient-to-br from-surface2 to-surface border-y border-line">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-16 grid lg:grid-cols-2 gap-10 lg:gap-[52px] items-center">
          <div>
            <h2 className="font-serif font-medium text-[clamp(28px,4vw,40px)]">
              {t("pa_title")}
            </h2>
            <p className="text-[15px] text-muted mt-3.5 mb-5">{t("pa_sub")}</p>
            <div className="grid gap-3">
              {[t("pa_b1"), t("pa_b2"), t("pa_b3"), t("pa_b4")].map((b) => (
                <div key={b} className="flex items-center gap-3 text-[15px]">
                  <span className="text-gold">◆</span> {b}
                </div>
              ))}
            </div>
            <Link
              href="/acceso"
              className="inline-block mt-7 bg-gold hover:bg-gold2 text-navy font-semibold text-[15px] px-8 py-3.5 rounded-full"
            >
              {t("pa_cta")}
            </Link>
          </div>
          <div className="bg-surface border border-line rounded-[18px] p-6 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2.5 border-b border-line2 pb-3.5">
              <LogoMark size={20} />
              <span className="font-serif text-lg tracking-[0.14em]">ÓRBITA</span>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {(
                [
                  ["◷", "Cronos", t("tz_cronos")],
                  ["⧉", "Bóveda", t("tz_boveda")],
                  ["◉", "Brújula", t("tz_brujula")],
                  ["◱", "Portafolio", t("tz_port")],
                ] as const
              ).map(([icon, name, desc]) => (
                <div key={name} className="bg-surface2 border border-line2 rounded-xl p-4">
                  <div className="text-gold text-xl">{icon}</div>
                  <div className="text-[13px] mt-2">{name}</div>
                  <div className="text-[11px] text-muted">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
