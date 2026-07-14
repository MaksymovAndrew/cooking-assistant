import { EMAIL_VERIFICATION_TOKEN_TTL_SECONDS } from "config/security";
import { ERROR_CODES, ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError, ValidationError } from "domain/errors/AppError";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { EmailSender } from "application/ports/EmailSender";
import type { TokenService } from "application/ports/TokenService";

// re-sends the verification link for the email already on file - used by Settings and the Home nudge
export default class RequestEmailVerification {
    constructor(
        private userRepository: Pick<UserRepository, "findById">,
        private tokenService: Pick<TokenService, "generatePurposeToken">,
        private emailSender: Pick<EmailSender, "sendVerificationEmail">,
        private frontendOrigin: string,
    ) {}

    async execute(userId: number): Promise<void> {
        const user = await this.userRepository.findById(userId);

        if (!user) {
            throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        if (user.email_verified_at) {
            throw new ValidationError(
                ERROR_MESSAGES.EMAIL_ALREADY_VERIFIED,
                ERROR_CODES.EMAIL_ALREADY_VERIFIED,
            );
        }

        const token = this.tokenService.generatePurposeToken(
            userId,
            "verify-email",
            EMAIL_VERIFICATION_TOKEN_TTL_SECONDS,
        );
        const link = `${this.frontendOrigin}/verify-email?token=${token}`;

        await this.emailSender.sendVerificationEmail(user.email, link);
    }
}
