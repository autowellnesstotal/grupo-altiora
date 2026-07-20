import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { addCaseUpdate, addOficio, addExhorto } from "@/app/actions/legal";
import { CaseForm } from "@/components/CaseForm";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full bg-surface2 border border-line2 focus:border-gold outline-none rounded-[9px] px-3 py-2.5 text-sm text-ivory";
const labelCls = "block text-xs text-muted mb-1.5";
const btnCls =
  "bg-gold hover:bg-gold2 text-navy font-semibold text-[13px] px-5 py-2.5 rounded-full";

function fmtDate(d: Date) {
  return new Intl.DateTimeFormat("es-MX", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export default async function ExpedienteDetallePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireRole("legal", "admin");
  const t = await getTranslations("portal");

  const c = await prisma.legalCase.findUnique({
    where: { id },
    include: {
      updates: { orderBy: { createdAt: "desc" }, take: 50 },
      oficios: { orderBy: { createdAt: "desc" } },
      exhortos: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!c) notFound();

  return (
    <div>
      <Link href="/portal/expedientes" className="text-[13px] text-muted hover:text-gold">
        ← {t("ex_t")}
      </Link>
      <h1 className="font-serif font-medium text-[30px] mt-2">
        {t("ex_th_exp")}{" "}
        <span className="font-mono text-gold text-2xl">{c.expediente}</span> ·{" "}
        <span className="text-muted text-2xl">{c.juzgado}</span>
      </h1>
      <p className="text-[15px] text-muted mt-1.5 mb-7">{c.demandado}</p>

      {/* Datos editables */}
      <details className="mb-8">
        <summary className="cursor-pointer text-sm text-gold hover:text-gold2 select-none">
          ✎ {t("ex_datos")}
        </summary>
        <div className="mt-4">
          <CaseForm
            caseId={c.id}
            defaults={{
              expediente: c.expediente,
              juzgado: c.juzgado,
              ciudad: c.ciudad,
              etapa: c.etapa,
              estatus: c.estatus,
              demandado: c.demandado,
              domicilio: c.domicilio,
              montoAdeudado: c.montoAdeudado == null ? null : Number(c.montoAdeudado),
              interesPct: c.interesPct == null ? null : Number(c.interesPct),
              fechaSuscripcion: c.fechaSuscripcion
                ? c.fechaSuscripcion.toISOString().slice(0, 10)
                : null,
            }}
            labels={{
              exp: t("ex_l_exp"),
              juz: t("ex_l_juz"),
              ciudad: t("ex_l_ciudad"),
              etapa: t("ex_l_etapa"),
              estatus: t("ex_l_estatus"),
              dem: t("ex_l_dem"),
              dom: t("ex_l_dom"),
              monto: t("ex_l_monto"),
              interes: t("ex_l_interes"),
              fecha: t("ex_l_fecha"),
              guardar: t("ex_guardar"),
              etapas: {
                ACTIVO: t("et_ACTIVO"),
                PENDIENTE: t("et_PENDIENTE"),
                PAGADO: t("et_PAGADO"),
                ARCHIVADO: t("et_ARCHIVADO"),
              },
            }}
          />
        </div>
      </details>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Bitácora */}
        <section>
          <h2 className="font-serif text-xl">{t("ex_bitacora")}</h2>
          <form action={addCaseUpdate} className="flex gap-2.5 mt-3.5">
            <input type="hidden" name="caseId" value={c.id} />
            <input
              name="texto"
              required
              maxLength={2000}
              placeholder={t("ex_bit_ph")}
              className={inputCls}
            />
            <button className={btnCls + " whitespace-nowrap"}>{t("ex_bit_add")}</button>
          </form>
          {c.updates.length === 0 ? (
            <p className="text-sm text-muted mt-5">{t("ex_bit_vacia")}</p>
          ) : (
            <ol className="mt-5 grid gap-2.5">
              {c.updates.map((u) => (
                <li key={u.id} className="bg-surface border border-line2 rounded-xl px-4.5 py-3.5">
                  <p className="text-sm leading-[1.6] text-ivory">{u.texto}</p>
                  <p className="text-[11px] text-muted mt-1.5">{fmtDate(u.createdAt)}</p>
                </li>
              ))}
            </ol>
          )}
        </section>

        <div className="grid gap-8">
          {/* Oficios */}
          <section>
            <h2 className="font-serif text-xl">{t("ex_oficios")}</h2>
            <details className="mt-3">
              <summary className="cursor-pointer text-[13px] text-gold hover:text-gold2 select-none">
                ＋ {t("ex_of_add")}
              </summary>
              <form
                action={addOficio}
                className="grid sm:grid-cols-2 gap-3 mt-3 bg-surface border border-line2 rounded-xl p-4"
              >
                <input type="hidden" name="caseId" value={c.id} />
                <label>
                  <span className={labelCls}>{t("ex_of_num")}</span>
                  <input name="numero" required maxLength={80} className={inputCls} />
                </label>
                <label>
                  <span className={labelCls}>{t("ex_of_dep")}</span>
                  <input name="dependencia" required maxLength={240} className={inputCls} />
                </label>
                <label>
                  <span className={labelCls}>{t("ex_of_est")}</span>
                  <input name="estatus" maxLength={300} className={inputCls} />
                </label>
                <label>
                  <span className={labelCls}>{t("ex_of_rev")}</span>
                  <input name="revisiones" maxLength={1000} className={inputCls} />
                </label>
                <label className="sm:col-span-2">
                  <span className={labelCls}>{t("ex_of_obs")}</span>
                  <input name="observaciones" maxLength={1000} className={inputCls} />
                </label>
                <div className="sm:col-span-2 flex justify-end">
                  <button className={btnCls}>{t("ex_of_add")}</button>
                </div>
              </form>
            </details>
            {c.oficios.length === 0 ? (
              <p className="text-sm text-muted mt-4">{t("ex_of_vacio")}</p>
            ) : (
              <ul className="mt-4 grid gap-2.5">
                {c.oficios.map((o) => (
                  <li key={o.id} className="bg-surface border border-line2 rounded-xl px-4.5 py-3.5 text-sm">
                    <div className="flex justify-between gap-3 flex-wrap">
                      <span className="font-mono text-gold">{o.numero}</span>
                      {o.estatus && <span className="text-muted text-[12px]">{o.estatus}</span>}
                    </div>
                    <p className="text-ivory mt-1">{o.dependencia}</p>
                    {o.observaciones && (
                      <p className="text-muted text-[13px] mt-1 leading-[1.55]">{o.observaciones}</p>
                    )}
                    {o.revisiones && (
                      <p className="text-muted text-[12px] mt-1 leading-[1.5]">↻ {o.revisiones}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Exhortos */}
          <section>
            <h2 className="font-serif text-xl">{t("ex_exhortos")}</h2>
            <details className="mt-3">
              <summary className="cursor-pointer text-[13px] text-gold hover:text-gold2 select-none">
                ＋ {t("ex_xh_add")}
              </summary>
              <form
                action={addExhorto}
                className="grid sm:grid-cols-2 gap-3 mt-3 bg-surface border border-line2 rounded-xl p-4"
              >
                <input type="hidden" name="caseId" value={c.id} />
                <label>
                  <span className={labelCls}>{t("ex_xh_num")}</span>
                  <input name="numero" maxLength={80} className={inputCls} />
                </label>
                <label>
                  <span className={labelCls}>{t("ex_xh_dest")}</span>
                  <input name="juzgadoDestino" maxLength={160} className={inputCls} />
                </label>
                <label className="sm:col-span-2">
                  <span className={labelCls}>{t("ex_xh_seg")}</span>
                  <input name="seguimiento" maxLength={1000} className={inputCls} />
                </label>
                <div className="sm:col-span-2 flex justify-end">
                  <button className={btnCls}>{t("ex_xh_add")}</button>
                </div>
              </form>
            </details>
            {c.exhortos.length === 0 ? (
              <p className="text-sm text-muted mt-4">{t("ex_xh_vacio")}</p>
            ) : (
              <ul className="mt-4 grid gap-2.5">
                {c.exhortos.map((x) => (
                  <li key={x.id} className="bg-surface border border-line2 rounded-xl px-4.5 py-3.5 text-sm">
                    <div className="flex justify-between gap-3 flex-wrap">
                      <span className="font-mono text-gold">{x.numero ?? "—"}</span>
                      {x.juzgadoDestino && (
                        <span className="text-muted text-[12px]">→ {x.juzgadoDestino}</span>
                      )}
                    </div>
                    {x.seguimiento && (
                      <p className="text-muted text-[13px] mt-1 leading-[1.55]">{x.seguimiento}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
