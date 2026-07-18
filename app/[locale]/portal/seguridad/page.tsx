import { getTranslations, setRequestLocale } from "next-intl/server";
import { requireUser } from "@/lib/session";
import { TwoFactorSetup } from "@/components/TwoFactorSetup";

export const dynamic = "force-dynamic";

export default async function SeguridadPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireUser();
  const t = await getTranslations("portal");

  const enabled =
    (session.user as { twoFactorEnabled?: boolean | null }).twoFactorEnabled === true;

  return (
    <div>
      <h1 className="font-serif font-medium text-[30px]">{t("seg_t")}</h1>
      <p className="text-[15px] text-muted mt-2 mb-6">{t("seg_s")}</p>
      <TwoFactorSetup
        initialEnabled={enabled}
        labels={{
          on: t("seg_on"),
          off: t("seg_off"),
          introOn: t("seg_intro_on"),
          introOff: t("seg_intro_off"),
          pass: t("seg_pass"),
          enable: t("seg_enable"),
          disable: t("seg_disable"),
          scan: t("seg_scan"),
          manual: t("seg_manual"),
          code: t("seg_code"),
          confirm: t("seg_confirm"),
          backupT: t("seg_backup_t"),
          backupS: t("seg_backup_s"),
          done: t("seg_done"),
          err: t("seg_err"),
        }}
      />
    </div>
  );
}
