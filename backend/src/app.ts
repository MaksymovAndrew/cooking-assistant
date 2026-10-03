import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";
import pinoHttp from "pino-http";

import { config } from "config/env";
import { logger } from "config/logger";
import {
    CORS_METHODS,
    HSTS_OPTIONS,
    JSON_BODY_LIMIT,
    TRUST_PROXY_HOPS,
} from "config/security";
import { ERROR_CODES } from "constants/errorCodes";
import { API_PREFIX, HEALTH_PATH, MEDIA_PATH_PREFIX } from "constants/routes";
import { NotFoundError } from "domain/errors/AppError";

import errorHandler from "middleware/errorHandler";
import { createGlobalLimiter } from "middleware/rateLimit";
import { createDomainRouters } from "routes/domainRouters";
import createHealthRouter from "routes/health.routes";
import createMediaRouter from "routes/media.routes";

import type { Controllers } from "./composition-root";

// req.url is raw: a cache-buster query or trailing slash still reaches the same route
const isQuietRequest = (req: { url?: string }): boolean => {
    const [pathname = ""] = (req.url ?? "").split("?");

    return (
        pathname.replace(/\/$/, "") === HEALTH_PATH ||
        pathname.startsWith(MEDIA_PATH_PREFIX)
    );
};

// a caller's id is kept for cross-service tracing, but only a plain token
const REQUEST_ID_PATTERN = /^[\w-]{1,64}$/;
const REQUEST_ID_HEADER = "x-request-id";

function requestId(req: IncomingMessage, res: ServerResponse): string {
    const incoming = req.headers[REQUEST_ID_HEADER];
    const id =
        typeof incoming === "string" && REQUEST_ID_PATTERN.test(incoming)
            ? incoming
            : randomUUID();

    res.setHeader(REQUEST_ID_HEADER, id);

    return id;
}

export function createApp(controllers: Controllers): Express {
    const app = express();

    app.set("trust proxy", TRUST_PROXY_HOPS);
    app.use(helmet({ hsts: HSTS_OPTIONS }));
    app.use(compression());
    app.use(
        pinoHttp({
            logger,
            genReqId: requestId,
            redact: [
                "req.headers.authorization",
                "req.headers.cookie",
                'res.headers["set-cookie"]',
            ],
            // the 15s probe and card images would crowd the 3 x 10 MB rotated logs
            autoLogging: { ignore: isQuietRequest },
        }),
    );
    app.use(
        cors({
            origin: config.corsOrigin,
            methods: CORS_METHODS,
            credentials: true,
        }),
    );
    app.use(express.json({ limit: JSON_BODY_LIMIT }));
    app.use(cookieParser());

    app.use(API_PREFIX, createHealthRouter(controllers.healthController));
    // ahead of the global limiter: a page loads an image per card, cached immutably
    app.use(API_PREFIX, createMediaRouter(controllers.mediaController));
    app.use(createGlobalLimiter());
    for (const router of createDomainRouters(controllers)) {
        app.use(API_PREFIX, router);
    }

    app.use((_req, _res, next) => {
        next(new NotFoundError(ERROR_CODES.NOT_FOUND));
    });
    app.use(errorHandler);

    return app;
}
