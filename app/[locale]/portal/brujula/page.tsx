import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireUser, userRole } from "@/lib/session";
import { SendMessageForm } from "@/components/SendMessageForm";

export const dynamic = "force-dynamic";

function Bubble({
  own,
  body,
  author,
}: {
  own: boolean;
  body: string;
  author: string;
}) {
  return (
    <div
      className={`max-w-[76%] px-4 py-3 text-sm leading-[1.6] rounded-xl ${
        own
          ? "self-end bg-gold text-navy rounded-br-[4px]"
          : "self-start bg-surface2 border border-line2 rounded-bl-[4px]"
      }`}
    >
      {!own && <div className="text-[10px] text-gold mb-1 uppercase tracking-wide">{author}</div>}
      {body}
    </div>
  );
}

export default async function BrujulaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireUser();
  const role = userRole(session);
  const t = await getTranslations("portal");
  const staff = role === "admin" || role === "agente";

  const threads = await prisma.messageThread.findMany({
    where: staff ? {} : { userId: session.user.id },
    include: {
      user: { select: { id: true, name: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <h1 className="font-serif font-medium text-[30px]">{t("bru_t")}</h1>
      <p className="text-[15px] text-muted mt-2 mb-6">{t("bru_s")}</p>

      <div className="grid gap-6 max-w-[760px]">
        {threads.length === 0 && !staff && (
          <div className="bg-surface border border-line2 rounded-[14px] overflow-hidden">
            <div className="p-6 min-h-[140px] flex items-center justify-center text-muted text-sm">
              {t("bru_empty")}
            </div>
            <SendMessageForm labels={{ ph: t("bru_ph"), send: t("bru_send") }} />
          </div>
        )}
        {threads.map((thread) => (
          <div key={thread.id} className="bg-surface border border-line2 rounded-[14px] overflow-hidden">
            {staff && (
              <div className="bg-surface2 border-b border-line2 px-5 py-3 text-sm">
                <span className="text-gold">◉</span> {thread.user.name}
              </div>
            )}
            <div className="p-5 flex flex-col gap-3.5 min-h-[120px] max-h-[420px] overflow-y-auto">
              {thread.messages.map((m) => (
                <Bubble
                  key={m.id}
                  own={m.authorId === session.user.id}
                  body={m.body}
                  author={m.author.name}
                />
              ))}
            </div>
            <SendMessageForm
              threadUserId={staff ? thread.user.id : undefined}
              labels={{ ph: t("bru_ph"), send: t("bru_send") }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
