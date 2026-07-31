import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { AUTH_COOKIE_NAME } from "config/cookie";
import { requireJwtSecret } from "config/env";
import { SESSION_TOKEN_TYPE } from "config/security";
import { ERROR_MESSAGES } from "constants/errorMessages";

// the typ claim must be checked positively: purpose tokens (password-reset, verify-email) are signed
// with the same secret, so accepting any well-formed { id } would let an emailed link act as a session
function isUserPayload(
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

const authenticateToken: RequestHandler = (req, res, next) => {
    const cookies = req.cookies as
        Record<string, string | undefined> | undefined;
    const token = cookies?.[AUTH_COOKIE_NAME]?.trim() ?? "";

    if (!token) {
        res.status(401).json({ error: ERROR_MESSAGES.SESSION_EXPIRED });

        return;
    }

    const secret = requireJwtSecret();

    jwt.verify(token, secret, { algorithms: ["HS256"] }, (err, decoded) => {
        if (err !== null || !isUserPayload(decoded)) {
            res.status(403).json({
                error: ERROR_MESSAGES.SESSION_EXPIRED,
            });

            return;
        }

        req.user = { id: decoded.id };
        next();
    });
};

export default authenticateToken;
