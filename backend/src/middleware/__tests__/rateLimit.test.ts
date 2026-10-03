import express, { type Request, type RequestHandler } from "express";
import type { Options as RateLimitOptions } from "express-rate-limit";
import request from "supertest";

import {
    AUTH_RATE_LIMIT,
    EMAIL_SEND_RATE_LIMIT,
    IP_RATE_LIMIT,
    REGISTER_IP_RATE_LIMIT,
} from "config/security";
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
const SUCCEEDING_PATH = "/ok";
const FAILING_PATH = "/rejected";

function appBehind(limiter: RequestHandler) {
    const app = express();

    app.use(limiter);
    app.get(SUCCEEDING_PATH, (_req, res) => {
        res.json({});
    });
    app.get(FAILING_PATH, (_req, res) => {
        res.status(401).json({});
    });
    app.use(errorHandler);

    return app;
}

// one at a time, so each response has settled the counter before the next request
async function statusesOf(
    app: ReturnType<typeof appBehind>,
    path: string,
    times: number,
): Promise<number[]> {
    const statuses: number[] = [];

    for (let i = 0; i < times; i += 1) {
        statuses.push((await request(app).get(path)).status);
    }

    return statuses;
}

function limitOf(policy: Partial<RateLimitOptions>): number {
    if (typeof policy.limit !== "number") {
        throw new TypeError("expected a policy with a fixed limit");
    }

    return policy.limit;
}

describe("createLimiter", () => {
    it("should answer past the limit with a 429 rate_limited error body", async () => {
        const app = appBehind(
            createLimiter(false, ipLimiterKey, {
                ...AUTH_RATE_LIMIT,
                limit: 1,
                skipSuccessfulRequests: false,
            }),
        );

        await request(app).get(SUCCEEDING_PATH);
        const res = await request(app).get(SUCCEEDING_PATH);

        expect(res.status).toBe(429);
        expect(res.body).toEqual(errorBody(ERROR_CODES.RATE_LIMITED));
        expect(res.headers["retry-after"]).toBeDefined();
    });
});

describe("rate limit policies", () => {
    it.each([
        ["sign-in attempts", AUTH_RATE_LIMIT],
        ["the per-IP sign-in backstop", IP_RATE_LIMIT],
    ])(
        "should never limit a success, only failures, for %s",
        async (_policy, policy) => {
            const app = appBehind(createLimiter(false, ipLimiterKey, policy));
            const limit = limitOf(policy);

            expect(
                await statusesOf(app, SUCCEEDING_PATH, limit + 1),
            ).not.toContain(429);

            await statusesOf(app, FAILING_PATH, limit);

            expect((await request(app).get(SUCCEEDING_PATH)).status).toBe(429);
        },
    );

    it.each([
        ["email sending", EMAIL_SEND_RATE_LIMIT],
        ["the per-IP registration backstop", REGISTER_IP_RATE_LIMIT],
    ])(
        "should count every request, successes included, for %s",
        async (_policy, policy) => {
            const app = appBehind(createLimiter(false, ipLimiterKey, policy));
            const limit = limitOf(policy);

            expect(await statusesOf(app, SUCCEEDING_PATH, limit + 1)).toEqual([
                ...Array.from({ length: limit }, () => 200),
                429,
            ]);
        },
    );
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

    it("should fall back to an empty string when there is no IP", () => {
        const req = {} as Request;

        expect(ipLimiterKey(req)).toBe("");
    });
});
