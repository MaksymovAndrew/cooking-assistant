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
        const req = {} as Request;
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.RECIPE_NOT_FOUND),
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should respond with the detail instead of the catalog text when the AppError carries one", () => {
        const err = new ValidationError(
            ERROR_CODES.VALIDATION_ERROR,
            "limit: Limit must be at most 100",
        );
        const req = {} as Request;
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "limit: Limit must be at most 100",
            code: ERROR_CODES.VALIDATION_ERROR,
        });
    });

    it("should hide an AppError with a 5xx status behind server_error", () => {
        const err = new AppError(
            ERROR_CODES.RECIPE_NOT_FOUND,
            503,
            "pool down",
        );
        const req = {} as Request;
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
        const req = {} as Request;
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.SERVER_ERROR),
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should keep the message of a non-AppError with a 4xx status and mark it bad_request", () => {
        const err = Object.assign(new Error("Unexpected token in JSON"), {
            status: 400,
        });
        const req = {} as Request;
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            error: "Unexpected token in JSON",
            code: ERROR_CODES.BAD_REQUEST,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should fall back to the bad_request text when a 4xx non-AppError has no message", () => {
        const err = Object.assign(new Error(""), { status: 422 });
        const req = {} as Request;
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(422);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.BAD_REQUEST),
        );
    });

    it("should respond with 500 and server_error for a non-Error", () => {
        const req = {} as Request;
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler("broken", req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.SERVER_ERROR),
        );
        expect(next).not.toHaveBeenCalled();
    });

    it("should use 500 when the error object has a numeric status of 0", () => {
        const err = Object.assign({}, { status: 0 });
        const req = {} as Request;
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            errorBody(ERROR_CODES.SERVER_ERROR),
        );
    });

    it("should log a 4xx as one compact warn line without the stack", () => {
        const warnSpy = jest.spyOn(logger, "warn");
        const errorSpy = jest.spyOn(logger, "error");
        const err = new NotFoundError(ERROR_CODES.MENU_NOT_FOUND);

        errorHandler(err, {} as Request, makeResponse(), jest.fn());

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

        errorHandler(err, {} as Request, makeResponse(), jest.fn());

        expect(errorSpy).toHaveBeenCalledWith(err);
        expect(warnSpy).not.toHaveBeenCalled();
    });

    it("should pass the error to next when headers were sent", () => {
        const err = new Error("Too late");
        const req = {} as Request;
        const res = makeResponse(true);
        const next = jest.fn() as NextFunction;

        errorHandler(err, req, res, next);

        expect(next).toHaveBeenCalledWith(err);
        expect(res.status).not.toHaveBeenCalled();
    });
});
