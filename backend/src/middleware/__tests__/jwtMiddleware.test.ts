import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { SESSION_TOKEN_TYPE } from "config/security";
import { ERROR_MESSAGES } from "constants/errorMessages";
import { AppError } from "domain/errors/AppError";

import authenticateToken from "middleware/jwtMiddleware";

import { catchSyncError } from "test/helpers/assertions";

function makeResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
}

function makeRequest(cookies?: Record<string, string>): Request {
    return { cookies } as unknown as Request;
}

describe("jwtMiddleware", () => {
    const testSecret = process.env.JWT_SECRET_KEY ?? "";
    const originalSecret = process.env.JWT_SECRET_KEY;

    afterEach(() => {
        if (originalSecret == null) {
            delete process.env.JWT_SECRET_KEY;

            return;
        }

        process.env.JWT_SECRET_KEY = originalSecret;
    });

    it("should return 401 when the auth cookie is missing", () => {
        const req = makeRequest({});
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: ERROR_MESSAGES.SESSION_EXPIRED,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when the request has no cookies", () => {
        const req = makeRequest();
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: ERROR_MESSAGES.SESSION_EXPIRED,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 when the auth cookie is empty", () => {
        const req = makeRequest({ authToken: "" });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            error: ERROR_MESSAGES.SESSION_EXPIRED,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when token is invalid", () => {
        const req = makeRequest({ authToken: "broken-token" });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: ERROR_MESSAGES.SESSION_EXPIRED,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when token is expired", () => {
        const token = jwt.sign({ id: 7, typ: SESSION_TOKEN_TYPE }, testSecret, {
            expiresIn: -1,
        });
        const req = makeRequest({ authToken: token });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: ERROR_MESSAGES.SESSION_EXPIRED,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should throw a 500 AppError when JWT secret is missing", () => {
        const token = jwt.sign({ id: 7, typ: SESSION_TOKEN_TYPE }, testSecret);

        delete process.env.JWT_SECRET_KEY;
        const req = makeRequest({ authToken: token });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        const error = catchSyncError(() => authenticateToken(req, res, next));

        expect(error).toBeInstanceOf(AppError);
        expect(error).toMatchObject({
            message: ERROR_MESSAGES.JWT_NOT_CONFIGURED,
            status: 500,
        });
        expect(res.status).not.toHaveBeenCalled();
        expect(next).not.toHaveBeenCalled();
    });

    it("should attach the user and call next when token has a numeric id", () => {
        const token = jwt.sign({ id: 7, typ: SESSION_TOKEN_TYPE }, testSecret);
        const req = makeRequest({ authToken: token });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(req.user).toEqual({ id: 7 });
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should return 403 when token id is not numeric", () => {
        const token = jwt.sign(
            { id: "7", typ: SESSION_TOKEN_TYPE },
            testSecret,
        );
        const req = makeRequest({ authToken: token });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: ERROR_MESSAGES.SESSION_EXPIRED,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when token id is zero", () => {
        const token = jwt.sign({ id: 0, typ: SESSION_TOKEN_TYPE }, testSecret);
        const req = makeRequest({ authToken: token });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: ERROR_MESSAGES.SESSION_EXPIRED,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when token id is negative", () => {
        const token = jwt.sign({ id: -1, typ: SESSION_TOKEN_TYPE }, testSecret);
        const req = makeRequest({ authToken: token });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: ERROR_MESSAGES.SESSION_EXPIRED,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when token payload is a string", () => {
        const token = jwt.sign("string-payload", testSecret);
        const req = makeRequest({ authToken: token });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            error: ERROR_MESSAGES.SESSION_EXPIRED,
        });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 403 when the token carries no typ claim", () => {
        const token = jwt.sign({ id: 7 }, testSecret);
        const req = makeRequest({ authToken: token });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        authenticateToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    // purpose tokens are signed with the same secret, so only the typ claim keeps an emailed link from acting as a session
    it.each(["password-reset", "verify-email"])(
        "should return 403 when a %s purpose token is sent as the session cookie",
        (purpose) => {
            const token = jwt.sign({ id: 7, purpose }, testSecret);
            const req = makeRequest({ authToken: token });
            const res = makeResponse();
            const next = jest.fn() as NextFunction;

            authenticateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({
                error: ERROR_MESSAGES.SESSION_EXPIRED,
            });
            expect(next).not.toHaveBeenCalled();
            expect(req.user).toBeUndefined();
        },
    );
});
