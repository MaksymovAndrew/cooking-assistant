import type { Locale } from "constants/locales";

export interface EmailSender {
    sendPasswordResetEmail(
        to: string,
        link: string,
        locale: Locale,
    ): Promise<void>;
    sendVerificationEmail(
        to: string,
        link: string,
        locale: Locale,
    ): Promise<void>;
}
