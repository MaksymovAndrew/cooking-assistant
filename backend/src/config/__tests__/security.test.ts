import {
    AUTH_RATE_LIMIT,
    EMAIL_SEND_RATE_LIMIT,
    IP_RATE_LIMIT,
    REGISTER_IP_RATE_LIMIT,
} from "config/security";

describe("rate limit configs", () => {
    it("should skip successful requests for login/register/change-password/token-redemption", () => {
        expect(AUTH_RATE_LIMIT.skipSuccessfulRequests).toBe(true);
    });

    it("should skip successful requests for the login/reset/confirm IP backstop", () => {
        expect(IP_RATE_LIMIT.skipSuccessfulRequests).toBe(true);
    });

    it("should count every request for forgot-password/resend-verification, since a 200 is always the response", () => {
        expect(EMAIL_SEND_RATE_LIMIT.skipSuccessfulRequests).toBe(false);
    });

    it("should count every request for the register IP backstop, since a successful registration is the abuse case it guards against", () => {
        expect(REGISTER_IP_RATE_LIMIT.skipSuccessfulRequests).toBe(false);
    });
});
