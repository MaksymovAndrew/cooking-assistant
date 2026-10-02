import type { CookieOptions } from "express";

import { config } from "./env";

export const AUTH_COOKIE_NAME = "authToken";

const COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

// secure and domain stay env-gated so dev (same-origin proxy) needs no TLS
export const AUTH_COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProduction,
    domain: config.cookieDomain,
    path: "/",
    maxAge: COOKIE_MAX_AGE_MS,
};
