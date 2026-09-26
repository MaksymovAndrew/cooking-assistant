import { PASSWORD_RESET_TOKEN_TTL_SECONDS } from "config/security";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { EmailSender } from "application/ports/EmailSender";
import type { TokenService } from "application/ports/TokenService";
import { forgotPasswordSchema } from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

import { emailLink } from "./emailLink";

export default class RequestPasswordReset {
    constructor(
        private userRepository: Pick<
            UserRepository,
            "findPasswordResetCandidateByEmail"
        >,
        private tokenService: Pick<TokenService, "generatePurposeToken">,
        private emailSender: Pick<EmailSender, "sendPasswordResetEmail">,
        private frontendOrigin: string,
    ) {}

    async execute(input: unknown): Promise<void> {
        const { email } = validate(forgotPasswordSchema, input);
        const candidate =
            await this.userRepository.findPasswordResetCandidateByEmail(email);

        // silently no-ops for "no such email" and "unverified email" alike - same response either way (anti-enumeration)
        if (!candidate?.email_verified_at) {
            return;
        }

        // bound to the current password hash so the link stops working the moment it's used once
        const token = this.tokenService.generatePurposeToken(
            candidate.id,
            "password-reset",
            PASSWORD_RESET_TOKEN_TTL_SECONDS,
            candidate.password,
        );
        const link = emailLink(
            this.frontendOrigin,
            "/reset-password",
            token,
            candidate.locale,
        );

        await this.emailSender.sendPasswordResetEmail(
            email,
            link,
            candidate.locale,
        );
    }
}
