import express, { type ErrorRequestHandler } from "express";

import { IMAGE_UPLOAD_LIMIT } from "config/security";
import { ERROR_CODES } from "constants/errorCodes";
import { AppError } from "domain/errors/AppError";

// body-parser's own marker for a body over the limit
const TOO_LARGE_ERROR_TYPE = "entity.too.large";

function isOversizedBody(err: unknown): boolean {
    return (
        typeof err === "object" &&
        err !== null &&
        "type" in err &&
        err.type === TOO_LARGE_ERROR_TYPE
    );
}

const translateOversizedUpload: ErrorRequestHandler = (
    err,
    _req,
    _res,
    next,
) => {
    next(
        isOversizedBody(err)
            ? new AppError(ERROR_CODES.MEDIA_TOO_LARGE, 413)
            : err,
    );
};

// the request body is the image itself, whatever type it claims - the use case reads the bytes
// to decide what it is, so the declared Content-Type is deliberately not trusted here
export const readImageBody = [
    express.raw({ type: () => true, limit: IMAGE_UPLOAD_LIMIT }),
    translateOversizedUpload,
];
