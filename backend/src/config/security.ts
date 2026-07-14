import type { Options as RateLimitOptions } from "express-rate-limit";

import { config } from "config/env";
import { ERROR_CODES } from "constants/errorMessages";

// production hardening knobs kept in one auditable place so the app wiring in app.ts carries no magic numbers

const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
const ONE_MINUTE_IN_MS = 60 * 1000;
const ONE_MINUTE_IN_SECONDS = 60;
const ONE_HOUR_IN_SECONDS = 60 * ONE_MINUTE_IN_SECONDS;

// purpose-token lifetimes: short for reset (single-use emailed link), longer for verification (less time-sensitive)
export const PASSWORD_RESET_TOKEN_TTL_SECONDS = 30 * ONE_MINUTE_IN_SECONDS;
export const EMAIL_VERIFICATION_TOKEN_TTL_SECONDS = 24 * ONE_HOUR_IN_SECONDS;

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
    code: ERROR_CODES.RATE_LIMITED,
};

// coarse abuse cap applied to every request on top of the stricter auth limiter
export const GLOBAL_RATE_LIMIT: Partial<RateLimitOptions> = {
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: RATE_LIMIT_MESSAGE,
};

// stricter limiter for login/register/change-password/token-redemption: success is a legitimate one-time action, so only failed attempts (credential stuffing, token guessing) count
export const AUTH_RATE_LIMIT: Partial<RateLimitOptions> = {
    windowMs: ONE_MINUTE_IN_MS,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
    message: RATE_LIMIT_MESSAGE,
};

// coarse per-IP backstop with the same skip-successes semantics as AUTH_RATE_LIMIT, just looser and keyed purely by address
export const IP_RATE_LIMIT: Partial<RateLimitOptions> = {
    ...AUTH_RATE_LIMIT,
    limit: 20,
};

// register's IP backstop: a successful registration IS the resource being protected against mass creation, so every request counts, not just failures
export const REGISTER_IP_RATE_LIMIT: Partial<RateLimitOptions> = {
    ...AUTH_RATE_LIMIT,
    limit: 20,
    skipSuccessfulRequests: false,
};

// guards forgot-password/resend-verification: both always respond 200 by design (anti-enumeration), so every request counts, not just failures
export const EMAIL_SEND_RATE_LIMIT: Partial<RateLimitOptions> = {
    ...AUTH_RATE_LIMIT,
    skipSuccessfulRequests: false,
};
