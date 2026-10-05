import request from "supertest";

import { config } from "config/env";
import { ERROR_CODES } from "constants/errorCodes";
import { HEALTH_PATH } from "constants/routes";

import { errorBody } from "test/helpers/errorBody";
import { authCookie, buildTestApp } from "test/helpers/testApp";

const SIGN_OUT_EVERYWHERE_PATH = "/api/sign-out-everywhere";
const UUID_PATTERN =
    /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/;

describe("security hardening", () => {
    it("should set trust proxy from config", () => {
        const { app } = buildTestApp();

        expect(app.get("trust proxy")).toBe(config.trustProxyHops);
    });

    it("should include RateLimit-Limit header on domain routes", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get("/api/me");

        expect(res.headers["ratelimit-limit"]).toBe(
            String(config.rateLimitMax),
        );
    });

    it("should set the HSTS header with a one-year max-age and preload", async () => {
        const { app } = buildTestApp();

        const res = await request(app).get(HEALTH_PATH);

        expect(res.headers["strict-transport-security"]).toContain(
            "max-age=31536000",
        );
        expect(res.headers["strict-transport-security"]).toContain(
            "includeSubDomains",
        );
        expect(res.headers["strict-transport-security"]).toContain("preload");
    });

    it("should echo a well-formed request id the caller sent", async () => {
        const { app } = buildTestApp();

        const res = await request(app)
            .get(HEALTH_PATH)
            .set("X-Request-Id", "edge-42");

        expect(res.headers["x-request-id"]).toBe("edge-42");
    });

    it("should replace a missing or odd-looking request id with a fresh one", async () => {
        const { app } = buildTestApp();

        const missing = await request(app).get(HEALTH_PATH);
        const odd = await request(app)
            .get(HEALTH_PATH)
            .set("X-Request-Id", "not ok; drop table");

        expect(missing.headers["x-request-id"]).toMatch(UUID_PATTERN);
        expect(odd.headers["x-request-id"]).not.toBe("not ok; drop table");
        expect(odd.headers["x-request-id"]).toMatch(UUID_PATTERN);
    });

    it("should refuse a signed-in write sent from another site", async () => {
        const { app, deps } = buildTestApp();

        const res = await request(app)
            .post(SIGN_OUT_EVERYWHERE_PATH)
            .set("Cookie", authCookie())
            .set("Origin", "https://evil.example");

        expect(res.status).toBe(403);
        expect(res.body).toEqual(errorBody(ERROR_CODES.CROSS_ORIGIN_REQUEST));
        expect(deps.userRepository.revokeSessions).not.toHaveBeenCalled();
    });

    it("should accept a signed-in write sent from the frontend's origin", async () => {
        const { app, deps } = buildTestApp();

        deps.userRepository.revokeSessions.mockResolvedValue(1);
        deps.tokenService.generate.mockReturnValue("token-value");

        const res = await request(app)
            .post(SIGN_OUT_EVERYWHERE_PATH)
            .set("Cookie", authCookie())
            .set("Origin", config.corsOrigin);

        expect(res.status).toBe(200);
        expect(deps.userRepository.revokeSessions).toHaveBeenCalledTimes(1);
    });
});
