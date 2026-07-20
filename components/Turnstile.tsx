"use client";

import { useEffect, useRef } from "react";

// Widget de Cloudflare Turnstile. Renderiza explícitamente (sin auto-render)
// para controlar el ciclo de vida y devolver el token al formulario.
declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "auto" | "light" | "dark";
          language?: string;
        }
      ) => string;
      remove: (id: string) => void;
      reset: (id: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

const SCRIPT_ID = "cf-turnstile-script";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";

export function Turnstile({
  siteKey,
  onToken,
  locale,
}: {
  siteKey: string;
  onToken: (token: string | null) => void;
  locale?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  // Guardamos el callback en una ref para no re-renderizar el widget en cada cambio
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    let cancelled = false;

    function render() {
      if (cancelled || !ref.current || !window.turnstile || widgetId.current) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey: siteKey,
        theme: "auto",
        language: locale === "en" ? "en" : "es",
        callback: (token) => cb.current(token),
        "error-callback": () => cb.current(null),
        "expired-callback": () => cb.current(null),
      });
    }

    if (window.turnstile) {
      render();
    } else {
      window.onTurnstileLoad = render;
      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement("script");
        s.id = SCRIPT_ID;
        s.src = SCRIPT_SRC;
        s.async = true;
        s.defer = true;
        document.head.appendChild(s);
      }
    }

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {}
        widgetId.current = null;
      }
    };
  }, [siteKey, locale]);

  return <div ref={ref} className="mt-5" />;
}
