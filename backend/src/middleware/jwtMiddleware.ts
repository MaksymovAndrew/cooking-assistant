import type { RequestHandler } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

import { AUTH_COOKIE_NAME } from "config/cookie";
import { requireJwtSecret } from "config/env";
import { SESSION_TOKEN_TYPE } from "config/security";
import { ERROR_CODES } from "constants/errorCodes";
import { ForbiddenError, UnauthorizedError } from "domain/errors/AppError";
import type { UserRepository } from "domain/repositories/UserRepository";

type SessionVersions = Pick<UserRepository, "findSessionVersion">;

export interface SessionAuth {
    authenticateToken: RequestHandler;
    optionalAuth: RequestHandler;
}

// typ is checked positively: an emailed link shares the secret and must never act as a session
export function isSessionPayload(
    decoded: string | JwtPayload | undefined,
): decoded is JwtPayload & { id: number; sv: number } {
    if (typeof decoded !== "object") {
        return false;
    }

    return (
        decoded.typ === SESSION_TOKEN_TYPE &&
        typeof decoded.id === "number" &&
        Number.isInteger(decoded.id) &&
        decoded.id > 0 &&
        typeof decoded.sv === "number"
    );
}

export function readSessionCookie(req: {
    cookies?: Record<string, string | undefined>;
}): string {
    return req.cookies?.[AUTH_COOKIE_NAME]?.trim() ?? "";
}

// the session version must still match, so a stolen cookie dies with the old password
async function liveSessionUserId(
    token: string,
    sessions: SessionVersions,
): Promise<number | null> {
    const secret = requireJwtSecret();
    let decoded: string | JwtPayload;

    try {
        decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
    } catch {
        return null;
    }

    if (!isSessionPayload(decoded)) {
        return null;
    }

    const currentVersion = await sessions.findSessionVersion(decoded.id);

    return currentVersion === decoded.sv ? decoded.id : null;
}

export function createSessionAuth(sessions: SessionVersions): SessionAuth {
    const authenticateToken: RequestHandler = async (req, _res, next) => {
        const token = readSessionCookie(req);

        if (!token) {
            next(new UnauthorizedError(ERROR_CODES.SESSION_EXPIRED));

            return;
        }

        const userId = await liveSessionUserId(token, sessions);

        if (userId === null) {
            next(new ForbiddenError(ERROR_CODES.SESSION_EXPIRED));

            return;
        }

        req.user = { id: userId };
        next();
    };

    const optionalAuth: RequestHandler = async (req, _res, next) => {
        const token = readSessionCookie(req);
        const userId = token ? await liveSessionUserId(token, sessions) : null;

        if (userId !== null) {
            req.user = { id: userId };
        }

        next();
    };

    return { authenticateToken, optionalAuth };
}
