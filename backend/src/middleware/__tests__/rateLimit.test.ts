import express, {
    type NextFunction,
    type Request,
    type Response,
} from "express";
import request from "supertest";

import { AUTH_RATE_LIMIT } from "config/security";
import { ERROR_CODES } from "constants/errorCodes";

import errorHandler from "middleware/errorHandler";
import {
    authLimiterKey,
    createLimiter,
    emailLimiterKey,
    ipLimiterKey,
    userIdLimiterKey,
} from "middleware/rateLimit";

import { errorBody } from "test/helpers/errorBody";

const SHARED_IP = "203.0.113.5";

describe("createLimiter", () => {
    it("should call next in test mode", () => {
        const limiter = createLimiter(true, authLimiterKey);
        const next = jest.fn() as NextFunction;

        limiter({} as Request, {} as Response, next);

        expect(next).toHaveBeenCalledTimes(1);
    });

    it("should return the rate limiter middleware in production mode", () => {
        const limiter = createLimiter(false, authLimiterKey);

        expect(typeof limiter).toBe("function");
    });

    it("should answer past the limit with a 429 rate_limited error body", async () => {
        const app = express();

        app.use(
            createLimiter(false, ipLimiterKey, {
                ...AUTH_RATE_LIMIT,
                limit: 1,
                skipSuccessfulRequests: false,
            }),
        );
        app.get("/", (_req, res) => {
            res.json({});
        });
        app.use(errorHandler);

        await request(app).get("/");
        const res = await request(app).get("/");

        expect(res.status).toBe(429);
        expect(res.body).toEqual(errorBody(ERROR_CODES.RATE_LIMITED));
        expect(res.headers["retry-after"]).toBeDefined();
    });
});

describe("authLimiterKey", () => {
    it("should combine the client IP with the attempted login", () => {
        const req = { ip: SHARED_IP, body: { login: "alice" } } as Request;

        expect(authLimiterKey(req)).toBe(`${SHARED_IP}:alice`);
    });

    it("should give different accounts on the same IP separate keys", () => {
        const alice = { ip: SHARED_IP, body: { login: "alice" } } as Request;
        const bob = { ip: SHARED_IP, body: { login: "bob" } } as Request;

        expect(authLimiterKey(alice)).not.toBe(authLimiterKey(bob));
    });

    it("should fall back to an empty login when the body has none", () => {
        const req = { ip: SHARED_IP, body: {} } as Request;

        expect(authLimiterKey(req)).toBe(`${SHARED_IP}:`);
    });
});

describe("emailLimiterKey", () => {
    it("should combine the client IP with the attempted email", () => {
        const req = {
            ip: SHARED_IP,
            body: { email: "alice@example.com" },
        } as Request;

        expect(emailLimiterKey(req)).toBe(`${SHARED_IP}:alice@example.com`);
    });

    it("should fall back to an empty email when the body has none", () => {
        const req = { ip: SHARED_IP, body: {} } as Request;

        expect(emailLimiterKey(req)).toBe(`${SHARED_IP}:`);
    });
});

describe("userIdLimiterKey", () => {
    it("should key by the authenticated user id, not the IP", () => {
        const req = { ip: SHARED_IP, user: { id: 7 } } as Request;

        expect(userIdLimiterKey(req)).toBe("7");
    });

    it("should give different users on the same IP separate keys", () => {
        const alice = { ip: SHARED_IP, user: { id: 7 } } as Request;
        const bob = { ip: SHARED_IP, user: { id: 8 } } as Request;

        expect(userIdLimiterKey(alice)).not.toBe(userIdLimiterKey(bob));
    });

    it("should give the same user the same key regardless of IP", () => {
        const fromIpOne = {
            ip: "203.0.113.5",
            user: { id: 7 },
        } as Request;
        const fromIpTwo = {
            ip: "198.51.100.9",
            user: { id: 7 },
        } as Request;

        expect(userIdLimiterKey(fromIpOne)).toBe(userIdLimiterKey(fromIpTwo));
    });

    it("should fall back to the IP when there is no authenticated user", () => {
        const req = { ip: SHARED_IP } as Request;

        expect(userIdLimiterKey(req)).toBe(SHARED_IP);
    });
});

describe("ipLimiterKey", () => {
    it("should key purely by IP, ignoring any account identifier", () => {
        const req = {
            ip: SHARED_IP,
            body: { login: "alice" },
        } as Request;

        expect(ipLimiterKey(req)).toBe(SHARED_IP);
    });

    it("should give different accounts on the same IP the same key", () => {
        const alice = { ip: SHARED_IP, body: { login: "alice" } } as Request;
        const bob = { ip: SHARED_IP, body: { login: "bob" } } as Request;

        expect(ipLimiterKey(alice)).toBe(ipLimiterKey(bob));
    });

    it("should fall back to an empty string when there is no IP", () => {
        const req = {} as Request;

        expect(ipLimiterKey(req)).toBe("");
    });
});
