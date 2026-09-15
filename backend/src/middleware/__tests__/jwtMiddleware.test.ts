import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { SESSION_TOKEN_TYPE } from "config/security";
import { ERROR_CODES } from "constants/errorCodes";
import {
    AppError,
    ForbiddenError,
    UnauthorizedError,
} from "domain/errors/AppError";

import authenticateToken from "middleware/jwtMiddleware";

import { catchSyncError } from "test/helpers/assertions";

function makeRequest(cookies?: Record<string, string>): Request {
    return { cookies } as unknown as Request;
}

// rejections travel to errorHandler through next, so every one gets the shared { error, code } body
function makeNext() {
    return jest.fn((_error?: unknown) => null);
}

function passedError(next: ReturnType<typeof makeNext>): unknown {
    return next.mock.calls[0]?.[0];
}

describe("jwtMiddleware", () => {
    const testSecret = process.env.JWT_SECRET_KEY ?? "";
    const originalSecret = process.env.JWT_SECRET_KEY;
    const res = {} as Response;

    afterEach(() => {
        if (originalSecret == null) {
            delete process.env.JWT_SECRET_KEY;

            return;
        }

        process.env.JWT_SECRET_KEY = originalSecret;
    });

    it.each([
        ["the auth cookie is missing", {}],
        ["the request has no cookies", undefined],
        ["the auth cookie is empty", { authToken: "" }],
    ])("should reject with a 401 session_expired when %s", (_case, cookies) => {
        const req = makeRequest(cookies);
        const next = makeNext();

        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(passedError(next)).toBeAppError(
            UnauthorizedError,
            ERROR_CODES.SESSION_EXPIRED,
            401,
        );
    });

    it("should reject with a 403 session_expired when token is invalid", () => {
        const req = makeRequest({ authToken: "broken-token" });
        const next = makeNext();

        authenticateToken(req, res, next);

        expect(passedError(next)).toBeAppError(
            ForbiddenError,
            ERROR_CODES.SESSION_EXPIRED,
            403,
        );
    });

    it("should reject with a 403 session_expired when token is expired", () => {
        const token = jwt.sign({ id: 7, typ: SESSION_TOKEN_TYPE }, testSecret, {
            expiresIn: -1,
        });
        const req = makeRequest({ authToken: token });
        const next = makeNext();

        authenticateToken(req, res, next);

        expect(passedError(next)).toBeAppError(
            ForbiddenError,
            ERROR_CODES.SESSION_EXPIRED,
            403,
        );
    });

    it("should throw a plain configuration Error when JWT secret is missing", () => {
        const token = jwt.sign({ id: 7, typ: SESSION_TOKEN_TYPE }, testSecret);

        delete process.env.JWT_SECRET_KEY;
        const req = makeRequest({ authToken: token });
        const next = makeNext();

        const error = catchSyncError(() => authenticateToken(req, res, next));

        expect(error).toBeInstanceOf(Error);
        expect(error).not.toBeInstanceOf(AppError);
        expect(error).toHaveProperty("message", "JWT secret is not configured");
        expect(next).not.toHaveBeenCalled();
    });

    it("should attach the user and call next when token has a numeric id", () => {
        const token = jwt.sign({ id: 7, typ: SESSION_TOKEN_TYPE }, testSecret);
        const req = makeRequest({ authToken: token });
        const next = makeNext();

        authenticateToken(req, res, next);

        expect(req.user).toEqual({ id: 7 });
        expect(next).toHaveBeenCalledWith();
    });

    it.each([
        ["token id is not numeric", { id: "7", typ: SESSION_TOKEN_TYPE }],
        ["token id is zero", { id: 0, typ: SESSION_TOKEN_TYPE }],
        ["token id is negative", { id: -1, typ: SESSION_TOKEN_TYPE }],
        ["the token carries no typ claim", { id: 7 }],
    ])("should reject with a 403 when %s", (_case, payload) => {
        const token = jwt.sign(payload, testSecret);
        const req = makeRequest({ authToken: token });
        const next = makeNext();

        authenticateToken(req, res, next);

        expect(passedError(next)).toBeAppError(
            ForbiddenError,
            ERROR_CODES.SESSION_EXPIRED,
            403,
        );
        expect(req.user).toBeUndefined();
    });

    it("should reject with a 403 when token payload is a string", () => {
        const token = jwt.sign("string-payload", testSecret);
        const req = makeRequest({ authToken: token });
        const next = makeNext();

        authenticateToken(req, res, next);

        expect(passedError(next)).toBeAppError(
            ForbiddenError,
            ERROR_CODES.SESSION_EXPIRED,
            403,
        );
    });

    // purpose tokens are signed with the same secret, so only the typ claim keeps an emailed link from acting as a session
    it.each(["password-reset", "verify-email"])(
        "should reject with a 403 when a %s purpose token is sent as the session cookie",
        (purpose) => {
            const token = jwt.sign({ id: 7, purpose }, testSecret);
            const req = makeRequest({ authToken: token });
            const next = makeNext();

            authenticateToken(req, res, next);

            expect(passedError(next)).toBeAppError(
                ForbiddenError,
                ERROR_CODES.SESSION_EXPIRED,
                403,
            );
            expect(req.user).toBeUndefined();
        },
    );
});
