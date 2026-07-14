import { logger } from "config/logger";

import LoggingEmailService from "infrastructure/email/LoggingEmailService";

import { TEST_FRONTEND_ORIGIN } from "test/helpers/testConstants";

const TO = "user@example.com";
const LINK = `${TEST_FRONTEND_ORIGIN}/reset-password?token=abc`;

describe("LoggingEmailService", () => {
    it("should log the password reset link instead of sending it", async () => {
        const infoSpy = jest.spyOn(logger, "info").mockImplementation();
        const service = new LoggingEmailService();

        await service.sendPasswordResetEmail(TO, LINK);

        expect(infoSpy).toHaveBeenCalledWith(
            { to: TO, link: LINK },
            expect.any(String),
        );
    });

    it("should log the verification link instead of sending it", async () => {
        const infoSpy = jest.spyOn(logger, "info").mockImplementation();
        const service = new LoggingEmailService();

        await service.sendVerificationEmail(TO, LINK);

        expect(infoSpy).toHaveBeenCalledWith(
            { to: TO, link: LINK },
            expect.any(String),
        );
    });
});
