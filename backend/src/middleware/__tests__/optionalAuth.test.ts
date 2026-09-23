import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { SESSION_TOKEN_TYPE } from "config/security";

import { createSessionAuth } from "middleware/jwtMiddleware";

const SESSION_VERSION = 2;

function makeResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
}

function makeRequest(cookies?: Record<string, string>): Request {
    return { cookies } as unknown as Request;
}

function makeOptionalAuth(currentVersion: number | null = SESSION_VERSION) {
    return createSessionAuth({
        findSessionVersion: () => Promise.resolve(currentVersion),
    }).optionalAuth;
}

describe("optionalAuth", () => {
    const testSecret = process.env.JWT_SECRET_KEY ?? "";
    const sessionToken = () =>
        jwt.sign(
            { id: 7, typ: SESSION_TOKEN_TYPE, sv: SESSION_VERSION },
            testSecret,
        );

    it.each([
        ["the auth cookie is missing", {}],
        ["there are no cookies at all", undefined],
        ["the token is invalid", { authToken: "broken-token" }],
    ])("should continue as a guest when %s", async (_case, cookies) => {
        const req = makeRequest(cookies);
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        await makeOptionalAuth()(req, res, next);

        expect(req.user).toBeUndefined();
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should attach the user when the session is still live", async () => {
        const req = makeRequest({ authToken: sessionToken() });
        const next = jest.fn() as NextFunction;

        await makeOptionalAuth()(req, makeResponse(), next);

        expect(req.user).toEqual({ id: 7 });
        expect(next).toHaveBeenCalledWith();
    });

    // an ended session reads as a guest rather than an error: the route is open to guests anyway
    it("should continue as a guest when the session was ended by a password change", async () => {
        const req = makeRequest({ authToken: sessionToken() });
        const next = jest.fn() as NextFunction;

        await makeOptionalAuth(SESSION_VERSION + 1)(req, makeResponse(), next);

        expect(req.user).toBeUndefined();
        expect(next).toHaveBeenCalledWith();
    });

    // purpose tokens must stay rejected here too, same as authenticateToken - otherwise an emailed
    // reset/verify link would silently authenticate a guest browsing session as that user
    it.each(["password-reset", "verify-email"])(
        "should continue as a guest when a %s purpose token is sent",
        async (purpose) => {
            const token = jwt.sign({ id: 7, purpose }, testSecret);
            const req = makeRequest({ authToken: token });
            const next = jest.fn() as NextFunction;

            await makeOptionalAuth()(req, makeResponse(), next);

            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith();
        },
    );
});
