// importing this from a client component is a build error, not a silent cookie leak
import "server-only";

import { cookies, headers } from "next/headers";

import { AUTH_COOKIE_NAME } from "constants/auth";
import { HTTP_STATUS_NOT_FOUND } from "constants/http";
import type { Locale } from "constants/locales";

const DEFAULT_INTERNAL_API_URL = "http://localhost:3000";

// a hung API must not hold a render open: without a deadline requests pile up, memory with
// them, and the frontend container fails its own health check before the backend fails its
const REQUEST_TIMEOUT_MS = 5000;

const FORWARDED_FOR = "x-forwarded-for";

const apiUrl = (path: string): string =>
    `${process.env.API_INTERNAL_URL ?? DEFAULT_INTERNAL_API_URL}${path}`;

const request = async <T>(
    path: string,
    init: RequestInit,
): Promise<T | null> => {
    const response = await fetch(apiUrl(path), {
        ...init,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (response.status === HTTP_STATUS_NOT_FOUND) {
        return null;
    }

    if (!response.ok) {
        throw new Error(`GET ${path} answered ${String(response.status)}`);
    }

    return response.json() as Promise<T>;
};

// carries the visitor's session into the render, so a server-rendered page shows the same
// owner controls the browser would. The cookie is forwarded, never parsed - the API stays the
// only place a token is verified. The language is the page's, so any copy the API writes matches it
export const fetchAsVisitor = async <T>(
    path: string,
    locale: Locale,
): Promise<T | null> => {
    const [cookieStore, incoming] = await Promise.all([cookies(), headers()]);
    // only the session cookie travels on: everything else the browser holds for this origin is
    // none of the API's business
    const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
    // the API attributes rate limits to the last forwarded address; dropping it would make
    // every rendered request look like one client - this container
    const forwardedFor = incoming.get(FORWARDED_FOR);

    return request<T>(path, {
        headers: {
            "accept-language": locale,
            ...(authCookie
                ? { cookie: `${AUTH_COOKIE_NAME}=${authCookie.value}` }
                : {}),
            ...(forwardedFor ? { [FORWARDED_FOR]: forwardedFor } : {}),
        },
        // the response is assembled for one visitor's session; storing it would serve it to the next
        cache: "no-store",
    });
};

// no session, so the answer is the same for everyone and may be reused: for pages that are
// public by definition, such as the sitemap
export const fetchPublic = async <T>(
    path: string,
    revalidateSeconds: number,
): Promise<T | null> =>
    request<T>(path, { next: { revalidate: revalidateSeconds } });
