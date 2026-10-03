import type { Options as RateLimitOptions } from "express-rate-limit";

import { config } from "./env";

const ONE_YEAR_IN_SECONDS = 365 * 24 * 60 * 60;
const ONE_MINUTE_IN_MS = 60 * 1000;
const ONE_MINUTE_IN_SECONDS = 60;
const ONE_HOUR_IN_SECONDS = 60 * ONE_MINUTE_IN_SECONDS;

// reset links are short-lived; verification is less time-sensitive
export const PASSWORD_RESET_TOKEN_TTL_SECONDS = 30 * ONE_MINUTE_IN_SECONDS;
export const EMAIL_VERIFICATION_TOKEN_TTL_SECONDS = 24 * ONE_HOUR_IN_SECONDS;

// identified positively: an emailed link shares the secret and must never pass as a session
export const SESSION_TOKEN_TYPE = "session";

// cost 10 as in BcryptPasswordHasher, no known plaintext: an unknown login costs a real compare
export const LOGIN_TIMING_DECOY_HASH =
    "$2b$10$O4WKafxctEpIILFgblljtOaqxP0VV45UqReyQZS6ECNrj8NeX0qJ2";

export const TRUST_PROXY_HOPS = config.trustProxyHops;

export const JSON_BODY_LIMIT = "100kb";

// phone photos run to ~8 MB; applies to the upload routes only
export const IMAGE_UPLOAD_LIMIT = "10mb";

export const CORS_METHODS = "GET,HEAD,PUT,PATCH,POST,DELETE";

// keys never change (immutable); helmet's same-origin default would block the app subdomain
export const MEDIA_RESPONSE_HEADERS = {
    "Cache-Control": `public, max-age=${ONE_YEAR_IN_SECONDS}, immutable`,
    "Content-Disposition": "inline",
    "Cross-Origin-Resource-Policy": "same-site",
};

export const HSTS_OPTIONS = {
    maxAge: ONE_YEAR_IN_SECONDS,
    includeSubDomains: true,
    preload: true,
};

export const GLOBAL_RATE_LIMIT: Partial<RateLimitOptions> = {
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
};

// only failures count: a success is legitimate, credential stuffing and token guessing are not
export const AUTH_RATE_LIMIT: Partial<RateLimitOptions> = {
    windowMs: ONE_MINUTE_IN_MS,
    limit: 5,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true,
};

export const IP_RATE_LIMIT: Partial<RateLimitOptions> = {
    ...AUTH_RATE_LIMIT,
    limit: 20,
};

// successful registrations count too: mass account creation is the abuse
export const REGISTER_IP_RATE_LIMIT: Partial<RateLimitOptions> = {
    ...AUTH_RATE_LIMIT,
    limit: 20,
    skipSuccessfulRequests: false,
};

// every upload is a full decode and re-encode, so each request counts against the user
export const UPLOAD_RATE_LIMIT: Partial<RateLimitOptions> = {
    windowMs: 10 * ONE_MINUTE_IN_MS,
    limit: 20,
    standardHeaders: true,
    legacyHeaders: false,
};

// these always answer 200 (anti-enumeration), so every request counts, not just failures
export const EMAIL_SEND_RATE_LIMIT: Partial<RateLimitOptions> = {
    ...AUTH_RATE_LIMIT,
    skipSuccessfulRequests: false,
};
