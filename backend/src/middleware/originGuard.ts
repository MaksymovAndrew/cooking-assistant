import type { RequestHandler } from "express";

import { ERROR_CODES } from "constants/errorCodes";
import { ForbiddenError } from "domain/errors/AppError";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

// a browser names its origin on every write; a client that sends none carries no victim's cookie
export function createOriginGuard(allowedOrigin: string): RequestHandler {
    return (req, _res, next) => {
        const origin = req.get("Origin");
        const isForeignWrite =
            !SAFE_METHODS.has(req.method) &&
            typeof origin === "string" &&
            origin !== allowedOrigin;

        if (isForeignWrite) {
            next(new ForbiddenError(ERROR_CODES.CROSS_ORIGIN_REQUEST));

            return;
        }

        next();
    };
}
