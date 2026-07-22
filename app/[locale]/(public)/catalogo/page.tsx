import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getPublishedProperties } from "@/lib/catalog";
import { toCardData } from "@/lib/types";
import { CatalogGrid } from "@/components/CatalogGrid";

export const revalidate = 3600;

export async function generateMetadata() {
  const t = await getTranslations("catalog");
  return { title: t("title") };
}

export default async function CatalogoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tc] = await Promise.all([getTranslations("catalog"), getTranslations("common")]);
  const items = (await getPublishedProperties()).map(toCardData);

  return (
    <>
      <section className="bg-[radial-gradient(900px_400px_at_80%_-20%,rgba(200,162,74,0.10),transparent_60%),var(--color-surface2)] border-b border-line2">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-12 pb-8">
          <h1 className="font-serif font-medium text-[clamp(32px,5vw,46px)]">
            {t("title")}
          </h1>
          <p className="text-[17px] text-muted mt-3">{t("sub")}</p>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-8 pb-20">
        <div className="flex justify-end mb-4">
          <Link
            href="/"
            className="border border-line text-muted hover:border-gold hover:text-gold text-[14px] px-4.5 py-2 rounded-full"
          >
            ← {t("back")}
          </Link>
        </div>
        <CatalogGrid
          items={items}
          labels={{
            tagLegal: tc("tag_legal"),
            photoPh: tc("photo_ph"),
            avaluo: t("avaluo"),
            ver: t("ver"),
            consult: t("consult"),
            adj: tc("adj"),
            ces: tc("ces"),
            results: t("results"),
            empty: t("empty"),
            f_estado: tc("f_estado"),
            f_tipoinv: tc("f_tipoinv"),
            f_tipoinm: tc("f_tipoinm"),
            f_precio: tc("f_precio"),
            f_sel: tc("f_sel"),
            price_low: t("price_low"),
            price_mid: t("price_mid"),
            price_high: t("price_high"),
            ab_rec: t("ab_rec"),
            ab_banos: t("ab_banos"),
            ab_bano_1: t("ab_bano_1"),
          }}
        />
      </section>
    </>
  );
}
