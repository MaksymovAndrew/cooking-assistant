import type { NextFunction, Request, Response } from "express";

import { logger } from "config/logger";
import { ERROR_CODES } from "constants/errorCodes";
import {
    AppError,
    NotFoundError,
    ValidationError,
} from "domain/errors/AppError";

import errorHandler from "middleware/errorHandler";

import { errorBody } from "test/helpers/errorBody";

// no Accept-Language match - the default language
function makeRequest(language: string | false = false) {
    return Object.assign({} as Request, {
        acceptsLanguages: jest.fn().mockReturnValue(language),
    });
}

const LIMIT_TOO_BIG = new ValidationError(ERROR_CODES.VALIDATION_ERROR, [
    { path: "limit", message: "atMost", params: { max: 100 } },
]);

function makeResponse(headersSent = false) {
    return {
        headersSent,
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
}

describe("errorHandler", () => {
    it("should respond with the AppError status, catalog text and code", () => {
        const err = new NotFoundError(ERROR_CODES.RECIPE_NOT_FOUND);
        const req = makeRequest();
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.RECIPE_NOT_FOUND),
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should spell out each rejected field instead of the catalog text for a validation error", () => {
        const res = makeResponse();

        errorHandler(LIMIT_TOO_BIG, makeRequest(), res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "limit: Must be at most 100",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
    });

    it("should spell out a validation error in the language of the request", () => {
        const res = makeResponse();

        errorHandler(LIMIT_TOO_BIG, makeRequest("ru"), res, jest.fn());

        expect(res.json).toHaveBeenCalledWith({
            error: "limit: Должно быть не больше 100",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
    });

    it("should join several rejected fields and leave a field-less one unprefixed", () => {
        const err = new ValidationError(ERROR_CODES.VALIDATION_ERROR, [
            { path: "title", message: "required", params: {} },
            { path: "", message: "exactlyOneSource", params: {} },
        ]);
        const res = makeResponse();

        errorHandler(err, makeRequest(), res, jest.fn());

        expect(res.json).toHaveBeenCalledWith({
            error: "title: Required; Provide either a recipe or a menu, not both",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
    });

    it("should hide an AppError with a 5xx status behind server_error", () => {
        const err = new AppError(ERROR_CODES.RECIPE_NOT_FOUND, 503);
        const req = makeRequest();
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(503);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.SERVER_ERROR),
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should hide the message of a regular Error behind server_error", () => {
        const err = new Error("duplicate key value violates unique constraint");
        const req = makeRequest();
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.SERVER_ERROR),
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should answer a framework 4xx with the bad_request copy, never its own message", () => {
        const err = Object.assign(new Error("Unexpected token in JSON"), {
            status: 400,
        });
        const req = makeRequest();
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.BAD_REQUEST),
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should answer an oversized body with payload_too_large", () => {
        const err = Object.assign(new Error("request entity too large"), {
            status: 413,
        });
        const res = makeResponse();

        errorHandler(err, makeRequest(), res, jest.fn());

        expect(res.status).toHaveBeenCalledWith(413);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.PAYLOAD_TOO_LARGE),
        );
    });

    it("should respond with 500 and server_error for a non-Error", () => {
        const req = makeRequest();
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler("broken", req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.SERVER_ERROR),
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should log a 4xx as one compact warn line without the stack", () => {
        const warnSpy = jest.spyOn(logger, "warn");
        const errorSpy = jest.spyOn(logger, "error");
        const err = new NotFoundError(ERROR_CODES.MENU_NOT_FOUND);

        errorHandler(err, makeRequest(), makeResponse(), jest.fn());

        expect(warnSpy).toHaveBeenCalledWith(
            { status: 404, code: ERROR_CODES.MENU_NOT_FOUND },
            "Menu not found",
        );
        expect(errorSpy).not.toHaveBeenCalled();
    });

    it("should log a 5xx at error level", () => {
        const warnSpy = jest.spyOn(logger, "warn");
        const errorSpy = jest.spyOn(logger, "error");
        const err = new Error("connection refused");

        errorHandler(err, makeRequest(), makeResponse(), jest.fn());

        expect(errorSpy).toHaveBeenCalledWith(err);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("should pass the error to next when headers were sent", () => {
        const err = new Error("Too late");
        const req = makeRequest();
        const res = makeResponse(true);
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(next).toHaveBeenCalledWith(err);
        expect(res.status).not.toHaveBeenCalled();
    });
});
