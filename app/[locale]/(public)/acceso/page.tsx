import { getTranslations, setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/LoginForm";
import { LogoMark } from "@/components/Logo";

export async function generateMetadata() {
  const t = await getTranslations("access");
  return { title: t("form_title") };
}

export default async function AccesoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("access");

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-8 py-14 sm:py-16 grid lg:grid-cols-[1.05fr_.95fr] gap-12 lg:gap-14 items-center">
      <div className="border-l-[3px] border-gold pl-6">
        <h1 className="font-serif font-medium text-[clamp(32px,5vw,46px)]">
          {t("welcome")}
        </h1>
        <p className="text-base leading-[1.7] text-muted mt-4 max-w-[480px]">{t("intro")}</p>
        <div className="grid gap-3 mt-6 max-w-[440px]">
          {[t("b1"), t("b2"), t("b3"), t("b4")].map((b) => (
            <div key={b} className="flex items-center gap-3 text-[15px]">
              <span className="text-gold">◆</span> {b}
            </div>
          ))}
        </div>
        <p className="text-sm text-muted mt-6">{t("channels")}</p>
        <div className="mt-3.5 flex gap-9 flex-wrap">
          <div className="border-l-2 border-gold pl-3.5">
            <div className="text-xs text-muted">{t("att")}</div>
            <div className="text-sm text-gold">clientes@altiora.mx</div>
            <div className="text-[13px] text-muted">55 1084 3510</div>
          </div>
          <div className="border-l-2 border-gold pl-3.5">
            <div className="text-xs text-muted">{t("den")}</div>
            <div className="text-sm text-gold">etica@altiora.mx</div>
            <div className="text-[13px] text-muted">55 1084 3512</div>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-0 translate-x-4 translate-y-5 bg-gold rounded-2xl opacity-85 hidden sm:block" />
        <div className="relative bg-surface border border-line rounded-2xl px-7 sm:px-9 pt-9 pb-8 shadow-2xl shadow-black/45">
          <div className="flex items-center gap-2.5">
            <LogoMark size={22} />
            <h2 className="font-serif font-semibold text-[28px]">{t("form_title")}</h2>
          </div>
          <LoginForm
            siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            locale={locale}
            labels={{
              email: t("email"),
              password: t("password"),
              enter: t("enter"),
              error: t("error"),
              rateLimited: t("rate_limited"),
              tfaTitle: t("tfa_title"),
              tfaHint: t("tfa_hint"),
              tfaCode: t("tfa_code"),
              tfaVerify: t("tfa_verify"),
              tfaUseBackup: t("tfa_use_backup"),
              tfaUseTotp: t("tfa_use_totp"),
              tfaError: t("tfa_error"),
              captchaPending: t("captcha_pending"),
            }}
          />
          <p className="text-xs text-muted text-center mt-5 border-t border-line2 pt-4">
            {t("no_register")}
          </p>
        </div>
      </div>
    </section>
  );
}
