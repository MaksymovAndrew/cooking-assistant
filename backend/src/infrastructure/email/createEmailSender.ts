import type { EmailSender } from "application/ports/EmailSender";

import LoggingEmailService from "./LoggingEmailService";
import ResendEmailService from "./ResendEmailService";

export function createEmailSender(
    resendApiKey: string | undefined,
    emailFrom: string | undefined,
): EmailSender {
    if (resendApiKey && emailFrom) {
        return new ResendEmailService(resendApiKey, emailFrom);
    }

    return new LoggingEmailService();
}
