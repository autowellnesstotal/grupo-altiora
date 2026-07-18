import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://grupoaltiora.cloud"),
  title: {
    default: "Altiora — Inversión inmobiliaria patrimonial",
    template: "%s · Altiora",
  },
  description:
    "Bienes adjudicados y cesiones de derechos con servicios legales y fiscales incluidos.",
  robots: { index: false, follow: false }, // datos de demostración
  openGraph: {
    type: "website",
    siteName: "Grupo Altiora",
    title: "Altiora — Inversión inmobiliaria patrimonial",
    description:
      "Bienes adjudicados y cesiones de derechos con servicios legales y fiscales incluidos.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Grupo Altiora" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og.png"],
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${cormorant.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Aplica el tema guardado antes del primer paint (evita flash) */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{localStorage.theme==="light"&&document.documentElement.classList.add("light")}catch(e){}',
          }}
        />
      </head>
      <body>
        {/* Sin `messages`: los textos van por props a las islas de cliente (bundle mínimo) */}
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
