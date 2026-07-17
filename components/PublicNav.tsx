import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LogoMark } from "./Logo";
import { LangSwitch } from "./LangSwitch";

function DropItem({ icon, title, sub }: { icon: string; title: string; sub: string }) {
  return (
    <div className="flex gap-3.5 rounded-[10px] p-3.5 hover:bg-surface2 cursor-default">
      <span className="text-gold text-xl leading-none">{icon}</span>
      <div>
        <div className="text-[15px]">{title}</div>
        <div className="text-xs text-muted mt-0.5">{sub}</div>
      </div>
    </div>
  );
}

export async function PublicNav() {
  const t = await getTranslations("common");
  return (
    <>
      {/* Barra demo */}
      <div className="bg-surface2 border-b border-line2 text-center px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase text-muted">
        {t("demo")}
      </div>

      {/* Barra utilitaria */}
      <div className="bg-surface2 border-b border-line2 text-[13px]">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-2 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-5 text-muted">
            <span className="flex items-center gap-1.5">
              <span className="text-gold">✆</span> {t("tel")}
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <span className="text-gold">✉</span> {t("mail")}
            </span>
          </div>
          <div className="flex items-center gap-3.5">
            <span className="text-gold hidden sm:inline">{t("ready")}</span>
            <span className="w-px h-3.5 bg-line hidden sm:block" />
            <LangSwitch />
          </div>
        </div>
      </div>

      {/* Nav principal */}
      <div className="sticky top-0 z-50 bg-navy/90 backdrop-blur-md border-b border-line">
        <div className="max-w-[1240px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-3">
            <LogoMark size={30} />
            <span className="leading-none">
              <span className="block font-serif text-[23px] font-semibold tracking-[0.16em] text-ivory">
                ALTIORA
              </span>
              <span className="block text-[9px] tracking-[0.34em] text-gold mt-0.5">
                {t("brand_sub")}
              </span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1.5 text-sm">
            <Link href="/" className="px-3 py-2 rounded-md hover:text-gold">
              {t("nav_home")}
            </Link>

            <details className="relative group">
              <summary className="list-none cursor-pointer px-3 py-2 rounded-md hover:text-gold flex items-center gap-1.5">
                {t("nav_about")} <span className="text-[9px] text-gold">▾</span>
              </summary>
              <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 w-[640px] bg-surface border border-line rounded-xl shadow-2xl shadow-black/40 p-3 grid grid-cols-2 gap-1">
                <DropItem icon="◷" title={t("nd_a")} sub={t("nd_as")} />
                <DropItem icon="◆" title={t("nd_b")} sub={t("nd_bs")} />
                <DropItem icon="✦" title={t("nd_c")} sub={t("nd_cs")} />
                <DropItem icon="◉" title={t("nd_d")} sub={t("nd_ds")} />
                <DropItem icon="❈" title={t("nd_e")} sub={t("nd_es")} />
                <DropItem icon="⚖" title={t("nd_f")} sub={t("nd_fs")} />
              </div>
            </details>

            <details className="relative">
              <summary className="list-none cursor-pointer px-3 py-2 rounded-md hover:text-gold flex items-center gap-1.5">
                {t("nav_services")} <span className="text-[9px] text-gold">▾</span>
              </summary>
              <div className="absolute left-1/2 -translate-x-1/2 top-full z-50 w-[640px] bg-surface border border-line rounded-xl shadow-2xl shadow-black/40 p-3 grid grid-cols-2 gap-1">
                <DropItem icon="◫" title={t("sd_a")} sub={t("sd_as")} />
                <DropItem icon="✧" title={t("sd_b")} sub={t("sd_bs")} />
                <DropItem icon="★" title={t("sd_c")} sub={t("sd_cs")} />
                <DropItem icon="⌘" title={t("sd_d")} sub={t("sd_ds")} />
              </div>
            </details>

            <Link href="/catalogo" className="px-3 py-2 rounded-md hover:text-gold">
              {t("nav_invest")}
            </Link>
            <Link href="/acceso" className="px-3 py-2 rounded-md hover:text-gold">
              {t("nav_portal")}
            </Link>
          </nav>

          <Link
            href="/acceso"
            className="bg-gold hover:bg-gold2 text-navy font-semibold text-sm px-5 py-2.5 rounded-full whitespace-nowrap"
          >
            {t("nav_signin")}
          </Link>
        </div>
      </div>
    </>
  );
}
