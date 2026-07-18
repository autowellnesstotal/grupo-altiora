import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSession, userRole } from "@/lib/session";
import { LogoMark } from "@/components/Logo";
import { SignOutButton } from "@/components/SignOutButton";
import { ThemeToggle } from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await getSession();
  if (!session) redirect("/acceso");
  if ((session.user as { banned?: boolean }).banned) redirect("/acceso");
  const role = userRole(session);
  const [t, tc] = await Promise.all([
    getTranslations("portal"),
    getTranslations("common"),
  ]);

  const items: { href: string; icon: string; label: string }[] = [];
  if (role === "agente" || role === "admin") {
    items.push(
      { href: "/portal/inventario", icon: "◱", label: t("inv") },
      { href: "/portal/inventario/nueva", icon: "＋", label: t("car") }
    );
  }
  if (role === "inversionista") {
    items.push({ href: "/portal/estado-cuenta", icon: "◱", label: t("estado") });
  }
  items.push(
    { href: "/portal/boveda", icon: "⧉", label: t("bov") },
    { href: "/portal/brujula", icon: "◉", label: t("bru") },
    { href: "/portal/seguridad", icon: "⚿", label: t("seg") }
  );
  if (role === "admin") {
    items.push({ href: "/portal/admin/usuarios", icon: "✦", label: t("cta_admin") });
  }

  const initial = (session.user.name || "A").charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-surface2 border-b border-line px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        <Link href="/portal" className="flex items-center gap-3">
          <LogoMark size={24} />
          <span>
            <span className="block font-serif text-xl tracking-[0.14em] leading-none">
              {t("brand")}
            </span>
            <span className="block text-[10px] tracking-[0.2em] text-gold uppercase mt-0.5">
              {t("sub")}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:flex items-center gap-2 text-[13px] text-muted">
            <span className="w-8 h-8 rounded-full bg-gold text-navy flex items-center justify-center font-semibold">
              {initial}
            </span>
            {session.user.name} · {t(`role_${role}`)}
          </span>
          <ThemeToggle label={tc("theme_toggle")} />
          <SignOutButton label={t("out")} />
        </div>
      </div>

      <div className="grid md:grid-cols-[230px_1fr] flex-1">
        <aside className="bg-surface2 border-b md:border-b-0 md:border-r border-line2 p-3.5 md:py-5 flex md:flex-col gap-1.5 overflow-x-auto">
          {items.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="flex items-center gap-3 text-sm px-3.5 py-3 rounded-[9px] hover:bg-gold/10 hover:text-gold whitespace-nowrap"
            >
              <span className="text-gold">{item.icon}</span> {item.label}
            </Link>
          ))}
        </aside>
        <main className="px-4 sm:px-9 py-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
