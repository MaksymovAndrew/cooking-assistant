import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import { config } from "config/env";
import {
    CORS_METHODS,
    HSTS_OPTIONS,
    JSON_BODY_LIMIT,
    TRUST_PROXY_HOPS,
} from "config/security";
import { ERROR_CODES } from "constants/errorCodes";
import { API_PREFIX } from "constants/routes";
import { NotFoundError } from "domain/errors/AppError";

import errorHandler from "middleware/errorHandler";
import { createOriginGuard } from "middleware/originGuard";
import { createGlobalLimiter } from "middleware/rateLimit";
import { createRequestLogger } from "middleware/requestLogger";
import { createDomainRouters } from "routes/domainRouters";
import createHealthRouter from "routes/health.routes";
import createMediaRouter from "routes/media.routes";

import type { Controllers } from "./composition-root";

export function createApp(controllers: Controllers): Express {
    const app = express();

    app.set("trust proxy", TRUST_PROXY_HOPS);
    app.use(helmet({ hsts: HSTS_OPTIONS }));
    app.use(compression());
    app.use(createRequestLogger());
    app.use(
        cors({
            origin: config.corsOrigin,
            methods: CORS_METHODS,
            credentials: true,
        }),
    );
    app.use(createOriginGuard(config.corsOrigin));
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
