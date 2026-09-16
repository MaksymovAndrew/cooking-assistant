import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { AUTH_COOKIE_NAME } from "config/cookie";
import { requireJwtSecret } from "config/env";
import { SESSION_TOKEN_TYPE } from "config/security";
import { ERROR_CODES } from "constants/errorCodes";
import { ForbiddenError, UnauthorizedError } from "domain/errors/AppError";

// the typ claim must be checked positively: purpose tokens (password-reset, verify-email) are signed
// with the same secret, so accepting any well-formed { id } would let an emailed link act as a session
export function isSessionPayload(
    decoded: string | JwtPayload | undefined,
): decoded is JwtPayload & {
    id: number;
} {
    if (typeof decoded !== "object") {
        return false;
    }

    return (
        decoded.typ === SESSION_TOKEN_TYPE &&
        typeof decoded.id === "number" &&
        Number.isInteger(decoded.id) &&
        decoded.id > 0
    );
}

// shared by optionalAuth, which needs the identical cookie lookup for a route a guest may also hit
export function readSessionCookie(req: {
    cookies?: Record<string, string | undefined>;
}): string {
    return req.cookies?.[AUTH_COOKIE_NAME]?.trim() ?? "";
}

const authenticateToken: RequestHandler = (req, _res, next) => {
    const token = readSessionCookie(req);

    if (!token) {
        next(new UnauthorizedError(ERROR_CODES.SESSION_EXPIRED));

        return;
    }

    const secret = requireJwtSecret();

    jwt.verify(token, secret, { algorithms: ["HS256"] }, (err, decoded) => {
        if (err !== null || !isSessionPayload(decoded)) {
            next(new ForbiddenError(ERROR_CODES.SESSION_EXPIRED));

            return;
        }

        req.user = { id: decoded.id };
        next();
    });
};

export default authenticateToken;
