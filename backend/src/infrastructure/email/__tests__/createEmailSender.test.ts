import { createEmailSender } from "infrastructure/email/createEmailSender";
import LoggingEmailService from "infrastructure/email/LoggingEmailService";
import ResendEmailService from "infrastructure/email/ResendEmailService";

describe("createEmailSender", () => {
    it("should return a ResendEmailService when both env vars are set", () => {
        const sender = createEmailSender("re_key", "noreply@example.com");

        expect(sender).toBeInstanceOf(ResendEmailService);
    });

    it("should return a LoggingEmailService when neither env var is set", () => {
        const sender = createEmailSender(undefined, undefined);

        expect(sender).toBeInstanceOf(LoggingEmailService);
    });
});
