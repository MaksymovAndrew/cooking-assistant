export interface EmailSender {
    sendPasswordResetEmail(to: string, link: string): Promise<void>;
    sendVerificationEmail(to: string, link: string): Promise<void>;
}
