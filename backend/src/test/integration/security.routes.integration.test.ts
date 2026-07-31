import request from "supertest";

import { config } from "config/env";

import { buildTestApp } from "test/helpers/testApp";

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

        const res = await request(app).get("/api/health");

        expect(res.headers["strict-transport-security"]).toContain(
            "max-age=31536000",
        );
        expect(res.headers["strict-transport-security"]).toContain(
            "includeSubDomains",
        );
        expect(res.headers["strict-transport-security"]).toContain("preload");
    });
});
