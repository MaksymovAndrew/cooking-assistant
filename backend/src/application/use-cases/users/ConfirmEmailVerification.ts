import { ERROR_CODES, ERROR_MESSAGES } from "constants/errorMessages";
import { UnauthorizedError } from "domain/errors/AppError";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { TokenService } from "application/ports/TokenService";
import { confirmEmailSchema } from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

export default class ConfirmEmailVerification {
    constructor(
        private userRepository: Pick<UserRepository, "markEmailVerified">,
        private tokenService: Pick<TokenService, "verifyPurposeToken">,
    ) {}

    async execute(input: unknown): Promise<void> {
        const { token } = validate(confirmEmailSchema, input);
        const userId = this.tokenService.verifyPurposeToken(
            token,
            "verify-email",
        );

        if (userId === null) {
            throw new UnauthorizedError(
                ERROR_MESSAGES.INVALID_OR_EXPIRED_TOKEN,
                ERROR_CODES.INVALID_OR_EXPIRED_TOKEN,
            );
        }

        await this.userRepository.markEmailVerified(userId);
    }
}
