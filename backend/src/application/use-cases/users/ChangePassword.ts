import { ERROR_CODES } from "constants/errorCodes";
import {
    NotFoundError,
    UnauthorizedError,
    ValidationError,
} from "domain/errors/AppError";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { PasswordHasher } from "application/ports/PasswordHasher";
import type { TokenService } from "application/ports/TokenService";
import { changePasswordSchema } from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

export default class ChangePassword {
    constructor(
        private userRepository: Pick<
            UserRepository,
            "findCredentialsById" | "updatePassword"
        >,
        private passwordHasher: Pick<PasswordHasher, "compare" | "hash">,
        private tokenService: Pick<TokenService, "generate">,
    ) {}

    // the change ends every other session; the one that made it gets a fresh token and stays signed in
    async execute(userId: number, input: unknown): Promise<{ token: string }> {
        const data = validate(changePasswordSchema, input);
        const credentials =
            await this.userRepository.findCredentialsById(userId);

        if (!credentials) {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }

        const isCurrentPasswordValid = await this.passwordHasher.compare(
            data.currentPassword,
            credentials.password,
        );

        if (!isCurrentPasswordValid) {
            throw new UnauthorizedError(ERROR_CODES.CURRENT_PASSWORD_INCORRECT);
        }

        const isSameAsCurrent = await this.passwordHasher.compare(
            data.newPassword,
            credentials.password,
        );

        if (isSameAsCurrent) {
            throw new ValidationError(ERROR_CODES.NEW_PASSWORD_SAME_AS_CURRENT);
        }

        const hashedPassword = await this.passwordHasher.hash(data.newPassword);

        const sessionVersion = await this.userRepository.updatePassword(
            userId,
            hashedPassword,
        );

        if (sessionVersion === null) {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }

        return { token: this.tokenService.generate(userId, sessionVersion) };
    }
}
