import jwt from "jsonwebtoken";

import JwtTokenService from "infrastructure/security/JwtTokenService";

const ONE_HOUR_SECONDS = 3600;
const PASSWORD_RESET = "password-reset";

describe("JwtTokenService", () => {
    it("should sign a token with the user id that verifies under HS256", () => {
        const service = new JwtTokenService();

        const token = service.generate(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY ?? "", {
            algorithms: ["HS256"],
        });

        expect(decoded).toMatchObject({ id: 7 });
    });

    describe("generatePurposeToken / verifyPurposeToken", () => {
        it("should round-trip a purpose token back to the user id", () => {
            const service = new JwtTokenService();

            const token = service.generatePurposeToken(
                7,
                PASSWORD_RESET,
                ONE_HOUR_SECONDS,
            );

            expect(service.verifyPurposeToken(token, PASSWORD_RESET)).toBe(7);
        });

        it("should reject a token verified against a different purpose", () => {
            const service = new JwtTokenService();

            const token = service.generatePurposeToken(
                7,
                PASSWORD_RESET,
                ONE_HOUR_SECONDS,
            );

            expect(
                service.verifyPurposeToken(token, "verify-email"),
            ).toBeNull();
        });

        it("should reject a session token (no purpose claim) as a purpose token", () => {
            const service = new JwtTokenService();

            const token = service.generate(7);

            expect(
                service.verifyPurposeToken(token, PASSWORD_RESET),
            ).toBeNull();
        });

        it("should reject an expired purpose token", () => {
            const service = new JwtTokenService();
            const ALREADY_EXPIRED_SECONDS = -1;

            const token = service.generatePurposeToken(
                7,
                PASSWORD_RESET,
                ALREADY_EXPIRED_SECONDS,
            );

            expect(
                service.verifyPurposeToken(token, PASSWORD_RESET),
            ).toBeNull();
        });

        it("should reject a garbage token string", () => {
            const service = new JwtTokenService();

            expect(
                service.verifyPurposeToken("not-a-jwt", PASSWORD_RESET),
            ).toBeNull();
        });

        it("should verify a bound token when the binding source is unchanged", () => {
            const service = new JwtTokenService();
            const passwordHash = "hashed-secret";

            const token = service.generatePurposeToken(
                7,
                PASSWORD_RESET,
                ONE_HOUR_SECONDS,
                passwordHash,
            );

            expect(
                service.verifyPurposeToken(token, PASSWORD_RESET, passwordHash),
            ).toBe(7);
        });

        it("should reject a bound token once the binding source has changed", () => {
            const service = new JwtTokenService();

            const token = service.generatePurposeToken(
                7,
                PASSWORD_RESET,
                ONE_HOUR_SECONDS,
                "hashed-secret",
            );

            expect(
                service.verifyPurposeToken(
                    token,
                    PASSWORD_RESET,
                    "hashed-new-secret",
                ),
            ).toBeNull();
        });

        it("should reject a binding check against a token that was generated without one", () => {
            const service = new JwtTokenService();

            const token = service.generatePurposeToken(
                7,
                PASSWORD_RESET,
                ONE_HOUR_SECONDS,
            );

            expect(
                service.verifyPurposeToken(
                    token,
                    PASSWORD_RESET,
                    "unexpected-binding",
                ),
            ).toBeNull();
        });
    });
});
