import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LogoLockup } from "./Logo";

export async function Footer() {
  const t = await getTranslations("common");
  return (
    <footer className="bg-surface2 border-t border-line">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 pt-12 pb-7">
        <div className="text-center">
          <LogoLockup height={44} className="mx-auto text-ivory" />
          <p className="font-serif italic text-[22px] text-gold mt-4">{t("ft_tag")}</p>
        </div>
        <div className="border-t border-line2 mt-8 pt-5 flex items-center justify-between gap-4 flex-wrap">
          <span className="text-[13px] text-muted">{t("ft_rights")}</span>
          <Link href="/aviso-de-privacidad" className="text-[13px] text-gold hover:text-gold2">
            {t("ft_priv")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
