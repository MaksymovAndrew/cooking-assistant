import type { Request, RequestHandler } from "express";
import rateLimit, {
    type Options as RateLimitOptions,
} from "express-rate-limit";

import {
    AUTH_RATE_LIMIT,
    EMAIL_SEND_RATE_LIMIT,
    GLOBAL_RATE_LIMIT,
    IP_RATE_LIMIT,
    REGISTER_IP_RATE_LIMIT,
} from "config/security";

// combines the client IP with a request-body field, so people sharing a network never share one account's quota
function bodyFieldLimiterKey(field: string) {
    return (req: Request): string => {
        const value = (req.body as Record<string, unknown> | undefined)?.[
            field
        ];

        return `${req.ip}:${typeof value === "string" ? value : ""}`;
    };
}

export const authLimiterKey = bodyFieldLimiterKey("login");
export const emailLimiterKey = bodyFieldLimiterKey("email");

// keyed by the authenticated user, not IP - the threat here is a stolen session cookie, not a shared network
export function userIdLimiterKey(req: Request): string {
    return String(req.user?.id ?? req.ip);
}

// the coarse per-IP backstop's key - deliberately ignores any account identifier
export function ipLimiterKey(req: Request): string {
    return req.ip ?? "";
}

export function createLimiter(
    testMode: boolean,
    keyGenerator: (req: Request) => string,
    options: Partial<RateLimitOptions> = AUTH_RATE_LIMIT,
): RequestHandler {
    if (testMode) {
        return (_req, _res, next) => {
            next();
        };
    }

    return rateLimit({ ...options, keyGenerator });
}

const isTestMode = process.env.NODE_ENV === "test";

// separate instances (own counter each) so testing one endpoint never burns another's quota
export const loginLimiter = createLimiter(isTestMode, authLimiterKey);
export const registerLimiter = createLimiter(isTestMode, authLimiterKey);
// layered under the per-account limiter above so spraying many distinct accounts from one IP still gets capped
export const loginIpLimiter = createLimiter(
    isTestMode,
    ipLimiterKey,
    IP_RATE_LIMIT,
);
// REGISTER_IP_RATE_LIMIT (not IP_RATE_LIMIT): a successful registration is itself the abuse case, so it must count
export const registerIpLimiter = createLimiter(
    isTestMode,
    ipLimiterKey,
    REGISTER_IP_RATE_LIMIT,
);
// EMAIL_SEND_RATE_LIMIT (not AUTH_RATE_LIMIT): these endpoints always respond 200, so every request must count
export const forgotPasswordLimiter = createLimiter(
    isTestMode,
    emailLimiterKey,
    EMAIL_SEND_RATE_LIMIT,
);
export const resendVerificationLimiter = createLimiter(
    isTestMode,
    userIdLimiterKey,
    EMAIL_SEND_RATE_LIMIT,
);
export const changePasswordLimiter = createLimiter(
    isTestMode,
    userIdLimiterKey,
);
// public token-redemption endpoints: no account/email field to key on, so IP is the only signal available
export const resetPasswordLimiter = createLimiter(
    isTestMode,
    ipLimiterKey,
    IP_RATE_LIMIT,
);
export const confirmEmailLimiter = createLimiter(
    isTestMode,
    ipLimiterKey,
    IP_RATE_LIMIT,
);

// NOT test-bypassed like loginLimiter/registerLimiter - an integration test asserts the live RateLimit-Limit header
export function createGlobalLimiter(): RequestHandler {
    return rateLimit(GLOBAL_RATE_LIMIT);
}
