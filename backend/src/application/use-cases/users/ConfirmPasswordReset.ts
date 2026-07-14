import { ERROR_CODES, ERROR_MESSAGES } from "constants/errorMessages";
import { UnauthorizedError, ValidationError } from "domain/errors/AppError";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { PasswordHasher } from "application/ports/PasswordHasher";
import type { TokenService } from "application/ports/TokenService";
import { resetPasswordSchema } from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

export default class ConfirmPasswordReset {
    constructor(
        private userRepository: Pick<
            UserRepository,
            "updatePassword" | "findCredentialsById"
        >,
        private passwordHasher: Pick<PasswordHasher, "compare" | "hash">,
        private tokenService: Pick<TokenService, "verifyPurposeToken">,
    ) {}

    async execute(input: unknown): Promise<void> {
        const data = validate(resetPasswordSchema, input);
        // two verify calls are unavoidable - the binding fingerprint needs the current password hash, which requires the id this first call resolves
        const claimedUserId = this.tokenService.verifyPurposeToken(
            data.token,
            "password-reset",
        );
        const credentials = claimedUserId
            ? await this.userRepository.findCredentialsById(claimedUserId)
            : null;
        // re-verified against the current password hash - fails once the token's already been used
        const userId = credentials
            ? this.tokenService.verifyPurposeToken(
                  data.token,
                  "password-reset",
                  credentials.password,
              )
            : null;

        if (userId === null || credentials === null) {
            throw new UnauthorizedError(
                ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
                ERROR_CODES.INVALID_OR_EXPIRED_TOKEN,
            );
        }

        const isSameAsCurrent = await this.passwordHasher.compare(
            data.newPassword,
            credentials.password,
        );

        if (isSameAsCurrent) {
            throw new ValidationError(
                ERROR_MESSAGES.NEW_PASSWORD_SAME_AS_CURRENT,
                ERROR_CODES.NEW_PASSWORD_SAME_AS_CURRENT,
            );
        }

        const hashedPassword = await this.passwordHasher.hash(data.newPassword);

        await this.userRepository.updatePassword(userId, hashedPassword);
    }
}
