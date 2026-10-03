// importing this from a client component is a build error, not a silent cookie leak
import "server-only";

import { cookies, headers } from "next/headers";

import { AUTH_COOKIE_NAME } from "constants/auth";
import { HTTP_STATUS_NOT_FOUND } from "constants/http";
import type { Locale } from "constants/locales";

const DEFAULT_INTERNAL_API_URL = "http://localhost:3000";

// a hung API must not hold renders open until the container fails its own health check
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

// the cookie is forwarded, never parsed: the API stays the only place a token is verified
export const fetchAsVisitor = async <T>(
    path: string,
    locale: Locale,
): Promise<T | null> => {
    const [cookieStore, incoming] = await Promise.all([cookies(), headers()]);
    // only the session cookie travels on; nothing else the browser holds is the API's business
    const authCookie = cookieStore.get(AUTH_COOKIE_NAME);
    // rate limits key on the forwarded address; without it every render looks like this container
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

// no session, so the answer is the same for everyone and may be cached (the sitemap)
export const fetchPublic = async <T>(
    path: string,
    revalidateSeconds: number,
): Promise<T | null> =>
    request<T>(path, { next: { revalidate: revalidateSeconds } });
