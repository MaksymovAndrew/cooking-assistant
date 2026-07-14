import {
    assertConsistentEmailConfig,
    assertSecureProductionDb,
} from "config/env";

describe("assertSecureProductionDb", () => {
    it("should throw when production with default db user", () => {
        expect(() => {
            assertSecureProductionDb({
                isProduction: true,
                db: { user: "postgres", password: "real-secure-pass" },
            });
        }).toThrow(
            "refusing to start in production with default database credentials",
        );
    });

    it("should throw when production with default db password", () => {
        expect(() => {
            assertSecureProductionDb({
                isProduction: true,
                db: { user: "real-user", password: "12345678" },
            });
        }).toThrow(
            "refusing to start in production with default database credentials",
        );
    });

    it("should not throw when production with secure credentials", () => {
        expect(() => {
            assertSecureProductionDb({
                isProduction: true,
                db: { user: "app_user", password: "secure-pass-123" },
            });
        }).not.toThrow();
    });

    it("should not throw in development even with default credentials", () => {
        expect(() => {
            assertSecureProductionDb({
                isProduction: false,
                db: { user: "postgres", password: "12345678" },
            });
        }).not.toThrow();
    });
});

describe("assertConsistentEmailConfig", () => {
    it("should not throw when neither is set", () => {
        expect(() => {
            assertConsistentEmailConfig({});
        }).not.toThrow();
    });

    it("should not throw when both are set", () => {
        expect(() => {
            assertConsistentEmailConfig({
                resendApiKey: "re_key",
                emailFrom: "noreply@example.com",
            });
        }).not.toThrow();
    });

    it("should throw when only the API key is set", () => {
        expect(() => {
            assertConsistentEmailConfig({ resendApiKey: "re_key" });
        }).toThrow("RESEND_API_KEY and EMAIL_FROM must be set together");
    });

    it("should throw when only the sender address is set", () => {
        expect(() => {
            assertConsistentEmailConfig({ emailFrom: "noreply@example.com" });
        }).toThrow("RESEND_API_KEY and EMAIL_FROM must be set together");
    });
});
