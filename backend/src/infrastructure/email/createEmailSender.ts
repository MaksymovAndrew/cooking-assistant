import type { EmailSender } from "application/ports/EmailSender";

import LoggingEmailService from "infrastructure/email/LoggingEmailService";
import ResendEmailService from "infrastructure/email/ResendEmailService";

// falls back to the logging adapter unless both Resend env vars are set, so local dev/CI never needs a real provider
export function createEmailSender(
    resendApiKey: string | undefined,
    emailFrom: string | undefined,
): EmailSender {
    if (resendApiKey && emailFrom) {
        return new ResendEmailService(resendApiKey, emailFrom);
    }

    return new LoggingEmailService();
}
