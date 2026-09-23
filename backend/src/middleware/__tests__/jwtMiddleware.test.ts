import type { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { SESSION_TOKEN_TYPE } from "config/security";
import { ERROR_CODES } from "constants/errorCodes";
import {
    AppError,
    ForbiddenError,
    UnauthorizedError,
} from "domain/errors/AppError";

import { createSessionAuth } from "middleware/jwtMiddleware";

import { catchError } from "test/helpers/assertions";

const SESSION_VERSION = 3;

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

function makeAuth(currentVersion: number | null = SESSION_VERSION) {
    const findSessionVersion = jest.fn((_id: number) =>
        Promise.resolve(currentVersion),
    );

    return {
        findSessionVersion,
        ...createSessionAuth({ findSessionVersion }),
    };
}

describe("jwtMiddleware", () => {
    const testSecret = process.env.JWT_SECRET_KEY ?? "";
    const originalSecret = process.env.JWT_SECRET_KEY;
    const res = {} as Response;
    const sessionToken = (payload: object = {}) =>
        jwt.sign(
            { id: 7, typ: SESSION_TOKEN_TYPE, sv: SESSION_VERSION, ...payload },
            testSecret,
        );

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
    ])(
        "should reject with a 401 session_expired when %s",
        async (_case, cookies) => {
            const next = makeNext();

            await makeAuth().authenticateToken(makeRequest(cookies), res, next);

            expect(next).toHaveBeenCalledTimes(1);
            expect(passedError(next)).toBeAppError(
                UnauthorizedError,
                ERROR_CODES.SESSION_EXPIRED,
                401,
            );
        },
    );

    it("should attach the user when the session version still matches", async () => {
        const auth = makeAuth();
        const req = makeRequest({ authToken: sessionToken() });
        const next = makeNext();

        await auth.authenticateToken(req, res, next);

        expect(auth.findSessionVersion).toHaveBeenCalledWith(7);
        expect(req.user).toEqual({ id: 7 });
        expect(next).toHaveBeenCalledWith();
    });

    // a password change or reset raises the version, ending every session issued before it
    it.each([
        [
            "the password changed since the token was issued",
            SESSION_VERSION + 1,
        ],
        ["the account no longer exists", null],
    ])(
        "should reject an ended session with a 403 when %s",
        async (_case, currentVersion) => {
            const req = makeRequest({ authToken: sessionToken() });
            const next = makeNext();

            await makeAuth(currentVersion).authenticateToken(req, res, next);

            expect(passedError(next)).toBeAppError(
                ForbiddenError,
                ERROR_CODES.SESSION_EXPIRED,
                403,
            );
            expect(req.user).toBeUndefined();
        },
    );

    it.each([
        ["the token is malformed", "broken-token"],
        [
            "the token is expired",
            jwt.sign({ id: 7, typ: SESSION_TOKEN_TYPE, sv: 3 }, "x", {
                expiresIn: -1,
            }),
        ],
        ["the payload is a string", jwt.sign("string-payload", "x")],
    ])(
        "should reject an unreadable token with a 403 when %s",
        async (_case, token) => {
            const next = makeNext();

            await makeAuth().authenticateToken(
                makeRequest({ authToken: token }),
                res,
                next,
            );

            expect(passedError(next)).toBeAppError(
                ForbiddenError,
                ERROR_CODES.SESSION_EXPIRED,
                403,
            );
        },
    );

    it.each([
        ["token id is not numeric", { id: "7" }],
        ["token id is zero", { id: 0 }],
        ["token id is negative", { id: -1 }],
        ["the token carries no typ claim", { typ: undefined }],
        ["the token carries no session version", { sv: undefined }],
    ])(
        "should reject a token with a bad payload with a 403 when %s",
        async (_case, payload) => {
            const auth = makeAuth();
            const req = makeRequest({ authToken: sessionToken(payload) });
            const next = makeNext();

            await auth.authenticateToken(req, res, next);

            expect(passedError(next)).toBeAppError(
                ForbiddenError,
                ERROR_CODES.SESSION_EXPIRED,
                403,
            );
            expect(auth.findSessionVersion).not.toHaveBeenCalled();
        },
    );

    // purpose tokens are signed with the same secret, so only the typ claim keeps an emailed link from acting as a session
    it.each(["password-reset", "verify-email"])(
        "should reject with a 403 when a %s purpose token is sent as the session cookie",
        async (purpose) => {
            const token = jwt.sign({ id: 7, purpose }, testSecret);
            const req = makeRequest({ authToken: token });
            const next = makeNext();

            await makeAuth().authenticateToken(req, res, next);

            expect(passedError(next)).toBeAppError(
                ForbiddenError,
                ERROR_CODES.SESSION_EXPIRED,
                403,
            );
            expect(req.user).toBeUndefined();
        },
    );

    it("should fail with a plain configuration Error when the JWT secret is missing", async () => {
        const token = sessionToken();

        delete process.env.JWT_SECRET_KEY;
        const next = makeNext();

        const error = await catchError(
            Promise.resolve(
                makeAuth().authenticateToken(
                    makeRequest({ authToken: token }),
                    res,
                    next,
                ),
            ),
        );

        expect(error).toBeInstanceOf(Error);
        expect(error).not.toBeInstanceOf(AppError);
        expect(error).toHaveProperty("message", "JWT secret is not configured");
        expect(next).not.toHaveBeenCalled();
    });
});
