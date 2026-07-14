import { logger } from "config/logger";

import type { EmailSender } from "application/ports/EmailSender";

// picked whenever RESEND_API_KEY is unset - logs the link instead of sending it
export default class LoggingEmailService implements EmailSender {
    sendPasswordResetEmail(to: string, link: string): Promise<void> {
        logger.info(
            { to, link },
            "Password reset email (not sent - no RESEND_API_KEY configured)",
        );

        return Promise.resolve();
    }

    sendVerificationEmail(to: string, link: string): Promise<void> {
        logger.info(
            { to, link },
            "Verification email (not sent - no RESEND_API_KEY configured)",
        );

        return Promise.resolve();
    }
}
