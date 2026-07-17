import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Guard optimista del portal: sin cookie de sesión → al login.
  // (La autorización real por rol se re-verifica en el layout y en cada server action.)
  if (/^\/(en\/)?portal(\/|$)/.test(pathname)) {
    const session = getSessionCookie(req);
    if (!session) {
      const url = req.nextUrl.clone();
      url.pathname = pathname.startsWith("/en/") ? "/en/acceso" : "/acceso";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return intl(req);
}

export const config = {
  // Excluir api, estáticos y archivos con extensión
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
