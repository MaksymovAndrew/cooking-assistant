import type { NextRequest } from "next/server";
import { NextResponse, userAgent } from "next/server";

import { API_BASE_URL } from "config/env";
import {
    HTTP_STATUS_PERMANENT_REDIRECT,
    HTTP_STATUS_TEMPORARY_REDIRECT,
} from "constants/http";
import { LOCALE_COOKIE_NAME } from "constants/locales";

import {
    buildContentSecurityPolicy,
    CONTENT_SECURITY_POLICY_HEADER,
    createNonce,
    NONCE_HEADER,
} from "utils/contentSecurityPolicy";
import type { LocaleRoute } from "utils/localeRouting";
import { resolveLocaleRoute } from "utils/localeRouting";

// where an unprefixed address sends a visitor depends on their language, so a cache must key on it
const VARY_BY_PREFERENCE = "Accept-Language, Cookie";

const IS_DEVELOPMENT = process.env.NODE_ENV === "development";

// Next reads the nonce off the request's policy and stamps it on every script it renders
const renderWithNonce = (
    request: NextRequest,
    rewriteTo: URL | null,
): NextResponse => {
    const nonce = createNonce();
    const policy = buildContentSecurityPolicy({
        nonce,
        apiBaseUrl: API_BASE_URL,
        allowEval: IS_DEVELOPMENT,
    });
    const headers = new Headers(request.headers);

    headers.set(NONCE_HEADER, nonce);
    headers.set(CONTENT_SECURITY_POLICY_HEADER, policy);

    const init = { request: { headers } };
    const response = rewriteTo
        ? NextResponse.rewrite(rewriteTo, init)
        : NextResponse.next(init);

    response.headers.set(CONTENT_SECURITY_POLICY_HEADER, policy);

    return response;
};

const respond = (request: NextRequest, route: LocaleRoute): NextResponse => {
    if (route.kind === "pass") {
        return renderWithNonce(request, null);
    }

    const url = request.nextUrl.clone();

    url.pathname = route.pathname;

    if (route.kind === "rewrite") {
        return renderWithNonce(request, url);
    }

    if (route.permanent) {
        return NextResponse.redirect(url, HTTP_STATUS_PERMANENT_REDIRECT);
    }

    const response = NextResponse.redirect(url, HTTP_STATUS_TEMPORARY_REDIRECT);

    response.headers.set("Vary", VARY_BY_PREFERENCE);

    return response;
};

// every page lives under app/[locale]; the default language is served there without its prefix
export const proxy = (request: NextRequest): NextResponse =>
    respond(
        request,
        resolveLocaleRoute({
            pathname: request.nextUrl.pathname,
            cookieLocale:
                request.cookies.get(LOCALE_COOKIE_NAME)?.value ?? null,
            acceptLanguage: request.headers.get("accept-language"),
            isBot: userAgent(request).isBot,
        }),
    );

// the API proxy, build assets, the health probe and any file with an extension are not pages
export const config = {
    matcher: ["/((?!api/|api$|_next/|health$|.*\\.).*)"],
};
