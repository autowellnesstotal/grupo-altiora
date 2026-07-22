import { setRequestLocale } from "next-intl/server";
import { PublicNav } from "@/components/PublicNav";
import { Footer } from "@/components/Footer";

export default async function PublicLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Obligatorio en CADA layout/página que use next-intl: los segmentos
  // renderizan en paralelo y sin esto getTranslations (PublicNav/Footer)
  // opta por renderizado dinámico → DYNAMIC_SERVER_USAGE (500) en las
  // páginas ISR no prerenderizadas (p. ej. /en/propiedad/[slug]).
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PublicNav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
