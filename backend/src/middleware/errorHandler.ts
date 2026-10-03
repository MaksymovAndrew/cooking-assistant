import type { ErrorRequestHandler } from "express";

import { logger } from "config/logger";
import { ERROR_CODES, type ErrorCode } from "constants/errorCodes";
import type { Locale } from "constants/locales";
import { AppError, ValidationError } from "domain/errors/AppError";
import { errorField } from "domain/errors/errorField";
import { requestLocale } from "i18n/requestLocale";
import { translateError, translateValidationIssues } from "i18n/translate";

const SERVER_ERROR_STATUS = 500;
const PAYLOAD_TOO_LARGE_STATUS = 413;

interface ErrorBody {
    error: string;
    code: ErrorCode;
}

function getErrorStatus(err: unknown): number {
    if (err instanceof AppError) {
        return err.status;
    }

    const status = errorField(err, "status");

    return typeof status === "number" && status > 0
        ? status
        : SERVER_ERROR_STATUS;
}

function frameworkErrorCode(status: number): ErrorCode {
    return status === PAYLOAD_TOO_LARGE_STATUS
        ? ERROR_CODES.PAYLOAD_TOO_LARGE
        : ERROR_CODES.BAD_REQUEST;
}

function toErrorBody(err: unknown, status: number, locale: Locale): ErrorBody {
    // never leak internals (pg errors, config details) on 5xx responses, AppError included
    if (status >= SERVER_ERROR_STATUS) {
        return {
            error: translateError(ERROR_CODES.SERVER_ERROR, locale),
            code: ERROR_CODES.SERVER_ERROR,
        };
    }

    if (err instanceof ValidationError && err.issues.length > 0) {
        return {
            error: translateValidationIssues(err.issues, locale),
            code: err.code,
        };
    }

    // a framework 4xx (broken JSON, oversized body) has no code, and its text is not ours to show
    const code =
        err instanceof AppError ? err.code : frameworkErrorCode(status);

    return { error: translateError(code, locale), code };
}

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const status = getErrorStatus(err);
    const body = toErrorBody(err, status, requestLocale(req));

    // a 4xx is one compact warn line, so bots probing unknown routes can't crowd the logs
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
