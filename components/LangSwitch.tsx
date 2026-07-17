"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export function LangSwitch() {
  const pathname = usePathname();
  const locale = useLocale();
  return (
    <span className="flex items-center gap-1 text-xs tracking-wider">
      <Link
        href={pathname}
        locale="es"
        className={locale === "es" ? "text-gold" : "text-muted hover:text-gold2"}
      >
        ES
      </Link>
      <span className="text-line">/</span>
      <Link
        href={pathname}
        locale="en"
        className={locale === "en" ? "text-gold" : "text-muted hover:text-gold2"}
      >
        EN
      </Link>
    </span>
  );
}
