import { ERROR_CODES, ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError, UnauthorizedError } from "domain/errors/AppError";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { PasswordHasher } from "application/ports/PasswordHasher";
import { deleteAccountSchema } from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

export default class DeleteAccount {
    constructor(
        private userRepository: Pick<
            UserRepository,
            "findCredentialsById" | "delete"
        >,
        private passwordHasher: Pick<PasswordHasher, "compare">,
    ) {}

    async execute(userId: number, input: unknown): Promise<void> {
        const data = validate(deleteAccountSchema, input);
        const credentials =
            await this.userRepository.findCredentialsById(userId);

        if (!credentials) {
            throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        const isPasswordValid = await this.passwordHasher.compare(
            data.password,
            credentials.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError(
                ERROR_MESSAGES.CURRENT_PASSWORD_INCORRECT,
                ERROR_CODES.CURRENT_PASSWORD_INCORRECT,
            );
        }

        await this.userRepository.delete(userId);
    }
}
