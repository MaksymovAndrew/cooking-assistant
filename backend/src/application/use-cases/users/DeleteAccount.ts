import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, UnauthorizedError } from "domain/errors/AppError";
import type { UserRepository } from "domain/repositories/UserRepository";

import type PhotoCleanup from "application/media/PhotoCleanup";
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
        private photoCleanup: PhotoCleanup,
    ) {}

    async execute(userId: number, input: unknown): Promise<void> {
        const data = validate(deleteAccountSchema, input);
        const credentials =
            await this.userRepository.findCredentialsById(userId);

        if (!credentials) {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }

        const isPasswordValid = await this.passwordHasher.compare(
            data.password,
            credentials.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedError(ERROR_CODES.CURRENT_PASSWORD_INCORRECT);
        }

        const photoKeys = await this.photoCleanup.keysOwnedBy(userId);

        await this.userRepository.delete(userId);
        await this.photoCleanup.removeAll(photoKeys);
    }
}
