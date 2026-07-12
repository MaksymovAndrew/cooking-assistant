import type { Options as RateLimitOptions } from "express-rate-limit";

import { config } from "config/env";

// production hardening knobs kept in one auditable place so the app wiring in app.ts carries no magic numbers

const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;

// trusted reverse-proxy / load-balancer hops (env TRUST_PROXY_HOPS; 0 in dev, 1 in prod)
export const TRUST_PROXY_HOPS = config.trustProxyHops;

export const JSON_BODY_LIMIT = "100kb";

export const CORS_METHODS = "GET,HEAD,PUT,PATCH,POST,DELETE";

export const HSTS_OPTIONS = {
    maxAge: ONE_YEAR_IN_SECONDS,
    includeSubDomains: true,
    preload: true,
};

// shared so every 429 keeps the codebase-wide { error } JSON contract
const RATE_LIMIT_MESSAGE = {
    error: "Too many requests, please try again later",
};

// coarse abuse cap applied to every request on top of the stricter auth limiter
export const GLOBAL_RATE_LIMIT: Partial<RateLimitOptions> = {
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: RATE_LIMIT_MESSAGE,
};

// stricter limiter guarding login/register against credential stuffing
export const AUTH_RATE_LIMIT: Partial<RateLimitOptions> = {
    windowMs: FIFTEEN_MINUTES_IN_MS,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: RATE_LIMIT_MESSAGE,
};
