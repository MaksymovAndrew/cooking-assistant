import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { SESSION_TOKEN_TYPE } from "config/security";

import optionalAuth from "middleware/optionalAuth";

function makeResponse() {
    return {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    } as unknown as Response;
}

function makeRequest(cookies?: Record<string, string>): Request {
    return { cookies } as unknown as Request;
}

describe("optionalAuth", () => {
    const testSecret = process.env.JWT_SECRET_KEY ?? "";

    it("should call next without setting req.user when the auth cookie is missing", () => {
        const req = makeRequest({});
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        optionalAuth(req, res, next);

        expect(req.user).toBeUndefined();
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should call next without setting req.user when there are no cookies at all", () => {
        const req = makeRequest();
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        optionalAuth(req, res, next);

        expect(req.user).toBeUndefined();
        expect(next).toHaveBeenCalledWith();
    });

    it("should call next without setting req.user when the token is invalid", () => {
        const req = makeRequest({ authToken: "broken-token" });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        optionalAuth(req, res, next);

        expect(req.user).toBeUndefined();
        expect(next).toHaveBeenCalledWith();
        expect(res.status).not.toHaveBeenCalled();
    });

    it("should attach the user and call next when the token is a valid session token", () => {
        const token = jwt.sign({ id: 7, typ: SESSION_TOKEN_TYPE }, testSecret);
        const req = makeRequest({ authToken: token });
        const res = makeResponse();
        const next = jest.fn() as NextFunction;

        optionalAuth(req, res, next);

        expect(req.user).toEqual({ id: 7 });
        expect(next).toHaveBeenCalledWith();
    });

    // purpose tokens must stay rejected here too, same as authenticateToken - otherwise an emailed
    // reset/verify link would silently authenticate a guest browsing session as that user
    it.each(["password-reset", "verify-email"])(
        "should call next without setting req.user when a %s purpose token is sent",
        (purpose) => {
            const token = jwt.sign({ id: 7, purpose }, testSecret);
            const req = makeRequest({ authToken: token });
            const res = makeResponse();
            const next = jest.fn() as NextFunction;

            optionalAuth(req, res, next);

            expect(req.user).toBeUndefined();
            expect(next).toHaveBeenCalledWith();
        },
    );
});
