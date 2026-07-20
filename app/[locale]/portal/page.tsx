import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, userRole } from "@/lib/session";
import { formatMXN } from "@/lib/catalog";

export const dynamic = "force-dynamic";

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface border border-line2 rounded-xl p-5">
      <div className="font-serif text-4xl text-gold leading-none">{value}</div>
      <div className="text-xs text-muted mt-2">{label}</div>
    </div>
  );
}

export default async function PortalHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireUser();
  const role = userRole(session);
  const t = await getTranslations("portal");

  if (role === "inversionista") {
    const statements = await prisma.statement.findMany({
      where: { userId: session.user.id },
    });
    const total = statements.reduce((acc, s) => acc + Number(s.saldo), 0);
    return (
      <div>
        <h1 className="font-serif font-medium text-[34px]">{t("welcome_investor")}</h1>
        <p className="text-[15px] text-muted mt-2 mb-7">{t("hello_investor")}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
          <Stat value={formatMXN(total)} label={t("st_saldo")} />
          <Link href="/portal/estado-cuenta" className="bg-surface border border-line2 hover:border-gold rounded-xl p-5">
            <div className="text-gold text-xl">◱</div>
            <div className="text-sm mt-2">{t("estado")}</div>
          </Link>
          <Link href="/portal/brujula" className="bg-surface border border-line2 hover:border-gold rounded-xl p-5">
            <div className="text-gold text-xl">◉</div>
            <div className="text-sm mt-2">{t("bru")}</div>
          </Link>
        </div>
      </div>
    );
  }

  if (role === "legal") {
    const [activos, pendientes, pagados] = await Promise.all([
      prisma.legalCase.count({ where: { etapa: "ACTIVO" } }),
      prisma.legalCase.count({ where: { etapa: "PENDIENTE" } }),
      prisma.legalCase.count({ where: { etapa: "PAGADO" } }),
    ]);
    return (
      <div>
        <h1 className="font-serif font-medium text-[34px]">{t("welcome_legal")}</h1>
        <p className="text-[15px] text-muted mt-2 mb-7">{t("hello_legal")}</p>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
          <Stat value={String(activos)} label={t("lg_activos")} />
          <Stat value={String(pendientes)} label={t("lg_pendientes")} />
          <Stat value={String(pagados)} label={t("lg_pagados")} />
        </div>
        <div className="mt-8 flex gap-3 flex-wrap">
          <Link
            href="/portal/expedientes"
            className="border border-gold text-gold hover:bg-gold hover:text-navy text-sm px-6 py-2.5 rounded-full transition"
          >
            ⚖ {t("exp")}
          </Link>
          <Link
            href="/portal/contratos"
            className="bg-gold hover:bg-gold2 text-navy font-semibold text-sm px-6 py-2.5 rounded-full"
          >
            ✎ {t("con")}
          </Link>
        </div>
      </div>
    );
  }

  const [total, adj, ces, sum] = await Promise.all([
    prisma.property.count(),
    prisma.property.count({ where: { categoria: "ADJUDICADO" } }),
    prisma.property.count({ where: { categoria: "CESION" } }),
    prisma.property.aggregate({ _sum: { precio: true } }),
  ]);

  const isAdmin = role === "admin";
  return (
    <div>
      <h1 className="font-serif font-medium text-[34px]">
        {isAdmin ? t("welcome_admin") : t("welcome_agent")}
      </h1>
      <p className="text-[15px] text-muted mt-2 mb-7">
        {isAdmin ? t("hello_admin") : t("hello_agent")}
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat value={String(total)} label={t("s1")} />
        <Stat value={String(adj)} label={t("s2")} />
        <Stat value={String(ces)} label={t("s3")} />
        <Stat value={formatMXN(Number(sum._sum.precio ?? 0))} label={t("s4")} />
      </div>
      <div className="mt-8 flex gap-3 flex-wrap">
        <Link
          href="/portal/inventario"
          className="border border-gold text-gold hover:bg-gold hover:text-navy text-sm px-6 py-2.5 rounded-full transition"
        >
          {t("inv")}
        </Link>
        <Link
          href="/portal/inventario/nueva"
          className="bg-gold hover:bg-gold2 text-navy font-semibold text-sm px-6 py-2.5 rounded-full"
        >
          ＋ {t("car")}
        </Link>
      </div>
    </div>
  );
}
