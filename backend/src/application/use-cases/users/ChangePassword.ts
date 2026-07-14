import { ERROR_CODES, ERROR_MESSAGES } from "constants/errorMessages";
import {
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from "domain/errors/AppError";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { PasswordHasher } from "application/ports/PasswordHasher";
import { changePasswordSchema } from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

export default class ChangePassword {
    constructor(
        private userRepository: Pick<
            UserRepository,
            "findCredentialsById" | "updatePassword"
        >,
        private passwordHasher: Pick<PasswordHasher, "compare" | "hash">,
    ) {}

    async execute(userId: number, input: unknown): Promise<void> {
        const data = validate(changePasswordSchema, input);
        const credentials =
            await this.userRepository.findCredentialsById(userId);

        if (!credentials) {
            throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const isCurrentPasswordValid = await this.passwordHasher.compare(
            data.currentPassword,
            credentials.password,
        );

        if (!isCurrentPasswordValid) {
            throw new UnauthorizedError(
                ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT,
                ERROR_CODES.CURRENT_PASSWORD_INCORRECT,
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
