import type { ErrorRequestHandler } from "express";

import { logger } from "config/logger";
import { ERROR_CODES, type ErrorCode } from "constants/errorCodes";
import { AppError } from "domain/errors/AppError";
import { translateError } from "i18n/translate";

const SERVER_ERROR_STATUS = 500;

interface ErrorBody {
    error: string;
    code: ErrorCode;
}

function getErrorStatus(err: unknown): number {
    if (err instanceof AppError) {
        return err.status;
    }

    const hasStatus =
        typeof err === "object" && err !== null && "status" in err;

    if (hasStatus) {
        const { status } = err as { status?: unknown };

        if (typeof status === "number") {
            return status || SERVER_ERROR_STATUS;
        }
    }

    return SERVER_ERROR_STATUS;
}

function toErrorBody(err: unknown, status: number): ErrorBody {
    // never leak internals (pg errors, config details) on 5xx responses, AppError included
    if (status >= SERVER_ERROR_STATUS) {
        return {
            error: translateError(ERROR_CODES.SERVER_ERROR),
            code: ERROR_CODES.SERVER_ERROR,
        };
    }

    if (err instanceof AppError) {
        return {
            error: err.detail ?? translateError(err.code),
            code: err.code,
        };
    }

    // a framework 4xx (malformed JSON, oversized body) has no code of its own
    const message = err instanceof Error ? err.message : "";

    return {
        error: message || translateError(ERROR_CODES.BAD_REQUEST),
        code: ERROR_CODES.BAD_REQUEST,
    };
}

const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
    const status = getErrorStatus(err);
    const body = toErrorBody(err, status);

    // a 4xx is the client's mistake, not an incident: one compact warn line with no stack, so bots
    // probing unknown routes can't crowd the rotated logs - only a 5xx is logged in full
    if (status >= SERVER_ERROR_STATUS) {
        logger.error(err);
    } else {
        logger.warn({ status, code: body.code }, body.error);
    }

    if (res.headersSent) {
        next(err);

        return;
    }

    res.status(status).json(body);
};

export default errorHandler;
