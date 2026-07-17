import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireUser, userRole } from "@/lib/session";
import { UploadDocForm } from "@/components/UploadDocForm";

export const dynamic = "force-dynamic";

function formatBytes(n: number) {
  return n > 1024 * 1024 ? `${(n / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
}

export default async function BovedaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireUser();
  const role = userRole(session);
  const t = await getTranslations("portal");

  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" },
    include: { property: { select: { clave: true, tipo: true } } },
  });
  const properties =
    role === "agente" || role === "admin"
      ? await prisma.property.findMany({
          orderBy: { clave: "asc" },
          select: { id: true, clave: true, tipo: true },
        })
      : [];

  return (
    <div>
      <h1 className="font-serif font-medium text-[30px]">{t("bov_t")}</h1>
      <p className="text-[15px] text-muted mt-2 mb-6">🔒 {t("bov_s")}</p>

      {(role === "agente" || role === "admin") && properties.length > 0 && (
        <div className="mb-7">
          <UploadDocForm
            properties={properties}
            labels={{ upload: t("bov_upload"), title: t("adm_name") }}
          />
        </div>
      )}

      {documents.length === 0 ? (
        <p className="text-muted">{t("bov_empty")}</p>
      ) : (
        <div className="grid gap-3 max-w-[820px]">
          {documents.map((d) => (
            <a
              key={d.id}
              href={`/api/uploads/${d.filePath}`}
              target="_blank"
              rel="noreferrer"
              className="bg-surface border border-line2 hover:border-gold rounded-[11px] px-5 py-4 flex items-center justify-between gap-4"
            >
              <span className="flex items-center gap-3.5">
                <span className="text-gold text-lg">⧉</span>
                <span>
                  <span className="block text-sm">
                    {d.title} · <span className="font-mono text-gold">{d.property.clave}</span>
                  </span>
                  <span className="block text-xs text-muted">
                    PDF · {formatBytes(d.sizeBytes)}
                  </span>
                </span>
              </span>
              <span className="text-muted text-[13px]">↓</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
