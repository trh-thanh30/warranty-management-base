import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { LOCALE_COOKIE_NAME, routing } from "@/src/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const savedLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
    const locale =
      routing.locales.find((candidate) => candidate === savedLocale) ??
      routing.defaultLocale;
    const destination = request.nextUrl.clone();

    destination.pathname = `/${locale}${routing.pathnames["/warranty"][locale]}`;

    return NextResponse.redirect(destination);
  }

  if (request.cookies.has(LOCALE_COOKIE_NAME)) {
    return handleI18nRouting(request);
  }

  const headers = new Headers(request.headers);
  headers.set("accept-language", routing.defaultLocale);

  return handleI18nRouting(new NextRequest(request, { headers }));
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
