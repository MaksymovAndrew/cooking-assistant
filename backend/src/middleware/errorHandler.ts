import type { ErrorRequestHandler } from "express";

import { logger } from "config/logger";
import { ERROR_MESSAGES } from "constants/errorMessages";
import { AppError } from "domain/errors/AppError";

function getErrorStatus(err: unknown): number {
    if (err instanceof AppError) {
        return err.status;
    }

    const hasStatus =
        typeof err === "object" && err !== null && "status" in err;

    if (hasStatus) {
        const { status } = err as { status?: unknown };

        if (typeof status === "number") {
            return status || 500;
        }
    }

    return 500;
}

function getErrorMessage(err: unknown, status: number): string {
    // never leak internals (pg errors, config details) on 5xx responses, AppError included
    if (status < 500 && err instanceof Error) {
        return err.message || ERROR_MESSAGES.SERVER_ERROR;
    }

    return ERROR_MESSAGES.SERVER_ERROR;
}

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    logger.error(err);

    if (res.headersSent) {
        _next(err);

        return;
    }

    const status = getErrorStatus(err);

    res.status(status).json({ error: getErrorMessage(err, status) });
};

export default errorHandler;
