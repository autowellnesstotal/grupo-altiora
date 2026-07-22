import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LogoMark } from "./Logo";
import { LangSwitch } from "./LangSwitch";
import { NavDropdown } from "./NavDropdown";
import { ThemeToggle } from "./ThemeToggle";

function DropItem({
  icon,
  title,
  sub,
  href,
}: {
  icon: string;
  title: string;
  sub: string;
  href: string;
}) {
  return (
    <Link href={href} className="flex gap-3.5 rounded-[10px] p-3.5 hover:bg-surface2">
      <span className="text-gold text-xl leading-none">{icon}</span>
      <span>
        <span className="block text-[16px]">{title}</span>
        <span className="block text-xs text-muted mt-0.5">{sub}</span>
      </span>
    </Link>
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
      <div className="bg-surface2 border-b border-line2 text-[14px]">
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
            <span className="w-px h-3.5 bg-line" />
            <ThemeToggle label={t("theme_toggle")} />
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

          <nav className="hidden lg:flex items-center gap-1.5 text-[15px]">
            <Link href="/" className="px-3 py-2 rounded-md hover:text-gold">
              {t("nav_home")}
            </Link>

            <NavDropdown label={t("nav_about")}>
              <DropItem href="/nosotros#conocenos" icon="◷" title={t("nd_a")} sub={t("nd_as")} />
              <DropItem href="/nosotros#pilares" icon="◆" title={t("nd_b")} sub={t("nd_bs")} />
              <DropItem href="/nosotros#filosofia" icon="✦" title={t("nd_c")} sub={t("nd_cs")} />
              <DropItem href="/nosotros#cobertura" icon="◉" title={t("nd_d")} sub={t("nd_ds")} />
              <DropItem href="/nosotros#responsabilidad" icon="❈" title={t("nd_e")} sub={t("nd_es")} />
              <DropItem href="/nosotros#etica" icon="⚖" title={t("nd_f")} sub={t("nd_fs")} />
            </NavDropdown>

            <NavDropdown label={t("nav_services")}>
              <DropItem href="/servicios#integrales" icon="◫" title={t("sd_a")} sub={t("sd_as")} />
              <DropItem href="/servicios#certificaciones" icon="✧" title={t("sd_b")} sub={t("sd_bs")} />
              <DropItem href="/servicios#calificaciones" icon="★" title={t("sd_c")} sub={t("sd_cs")} />
              <DropItem href="/servicios#tecnologia" icon="⌘" title={t("sd_d")} sub={t("sd_ds")} />
            </NavDropdown>

            <Link href="/catalogo" className="px-3 py-2 rounded-md hover:text-gold">
              {t("nav_invest")}
            </Link>
            <Link href="/acceso" className="px-3 py-2 rounded-md hover:text-gold">
              {t("nav_portal")}
            </Link>
          </nav>

          <Link
            href="/acceso"
            className="bg-gold hover:bg-gold2 text-navy font-semibold text-[15px] px-5 py-2.5 rounded-full whitespace-nowrap"
          >
            {t("nav_signin")}
          </Link>
        </div>
      </div>
    </>
  );
}
