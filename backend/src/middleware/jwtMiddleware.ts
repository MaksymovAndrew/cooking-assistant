import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { AUTH_COOKIE_NAME } from "config/cookie";
import { requireJwtSecret } from "config/env";
import { ERROR_MESSAGES } from "constants/errorMessages";

function isUserPayload(
    decoded: string | JwtPayload | undefined,
): decoded is JwtPayload & {
    id: number;
} {
    if (typeof decoded !== "object") {
        return false;
    }

    return (
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
