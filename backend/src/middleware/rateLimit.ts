import type { Request, RequestHandler } from "express";
import rateLimit, {
    ipKeyGenerator,
    type Options as RateLimitOptions,
} from "express-rate-limit";

import { config } from "config/env";
import {
    AUTH_RATE_LIMIT,
    EMAIL_SEND_RATE_LIMIT,
    GLOBAL_RATE_LIMIT,
    IP_RATE_LIMIT,
    REGISTER_IP_RATE_LIMIT,
    UPLOAD_RATE_LIMIT,
} from "config/security";
import { ERROR_CODES } from "constants/errorCodes";
import { AppError } from "domain/errors/AppError";

// through errorHandler, so a 429 gets the same { error, code } body as any failure
const rejectRateLimited: RateLimitOptions["handler"] = (_req, _res, next) => {
    next(new AppError(ERROR_CODES.RATE_LIMITED, 429));
};

// IPv6 collapses to its /56 so rotating within a subnet can't dodge it (express-rate-limit v8)
function normalizedIp(req: Request): string {
    return req.ip ? ipKeyGenerator(req.ip) : "";
}

// IP plus the account field, so people sharing a network never share a quota
function bodyFieldLimiterKey(field: string) {
    return (req: Request): string => {
        const value = (req.body as Record<string, unknown> | undefined)?.[
            field
        ];

        return `${normalizedIp(req)}:${typeof value === "string" ? value : ""}`;
    };
}

export const authLimiterKey = bodyFieldLimiterKey("login");
export const emailLimiterKey = bodyFieldLimiterKey("email");

// by user, not IP: the threat is a stolen session cookie, not a shared network
export function userIdLimiterKey(req: Request): string {
    return req.user ? String(req.user.id) : normalizedIp(req);
}

export function ipLimiterKey(req: Request): string {
    return normalizedIp(req);
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

    return rateLimit({ ...options, keyGenerator, handler: rejectRateLimited });
}

const isTestMode = config.nodeEnv === "test";

// separate instances, so hammering one endpoint never burns another's quota
export const loginLimiter = createLimiter(isTestMode, authLimiterKey);
export const registerLimiter = createLimiter(isTestMode, authLimiterKey);
// under the per-account limiter, so spraying many accounts from one IP still gets capped
export const loginIpLimiter = createLimiter(
    isTestMode,
    ipLimiterKey,
    IP_RATE_LIMIT,
);
export const registerIpLimiter = createLimiter(
    isTestMode,
    ipLimiterKey,
    REGISTER_IP_RATE_LIMIT,
);
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
export const signOutEverywhereLimiter = createLimiter(
    isTestMode,
    userIdLimiterKey,
);
export const deleteAccountLimiter = createLimiter(isTestMode, userIdLimiterKey);
// token redemption has no account field to key on, so IP is the only signal
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

export const uploadLimiter = createLimiter(
    isTestMode,
    userIdLimiterKey,
    UPLOAD_RATE_LIMIT,
);

// not test-bypassed: an integration test asserts the live RateLimit-Limit header
export function createGlobalLimiter(): RequestHandler {
    return rateLimit({ ...GLOBAL_RATE_LIMIT, handler: rejectRateLimited });
}
