import {
    buildContentSecurityPolicy,
    createNonce,
} from "utils/contentSecurityPolicy";

const NONCE = "bm9uY2U=";

describe("contentSecurityPolicy", () => {
    it("should allow only scripts carrying the request's nonce", () => {
        const policy = buildContentSecurityPolicy({
            nonce: NONCE,
            apiBaseUrl: "",
            allowEval: false,
        });

        expect(policy).toContain(
            `script-src 'self' 'nonce-${NONCE}' 'strict-dynamic';`,
        );
        expect(policy).not.toContain("unsafe-eval");
        expect(policy).toContain("frame-ancestors 'none'");
        expect(policy.endsWith("img-src 'self' data: blob:")).toBe(true);
    });

    it("should let images load from the API origin and eval run in development", () => {
        const policy = buildContentSecurityPolicy({
            nonce: NONCE,
            apiBaseUrl: "https://api.example.com/some/path",
            allowEval: true,
        });

        expect(policy).toContain("'strict-dynamic' 'unsafe-eval'");
        expect(policy).toContain(
            "img-src 'self' data: blob: https://api.example.com",
        );
    });

    it("should mint a different nonce for every request", () => {
        expect(createNonce()).not.toBe(createNonce());
    });
});
