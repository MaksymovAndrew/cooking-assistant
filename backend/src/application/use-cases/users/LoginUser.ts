import { LOGIN_TIMING_DECOY_HASH } from "config/security";
import { ERROR_CODES } from "constants/errorCodes";
import { UnauthorizedError } from "domain/errors/AppError";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { PasswordHasher } from "application/ports/PasswordHasher";
import type { TokenService } from "application/ports/TokenService";
import {
    emailSchema,
    loginUserSchema,
} from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

export default class LoginUser {
    constructor(
        private userRepository: Pick<
            UserRepository,
            "findByLogin" | "findCredentialsByEmail"
        >,
        private passwordHasher: Pick<PasswordHasher, "compare">,
        private tokenService: Pick<TokenService, "generate">,
    ) {}

    async execute(input: unknown): Promise<{ token: string }> {
        const data = validate(loginUserSchema, input);
        const asEmail = emailSchema().safeParse(data.login);
        const user = asEmail.success
            ? await this.userRepository.findCredentialsByEmail(asEmail.data)
            : await this.userRepository.findByLogin(data.login);

        // an unknown login runs a decoy compare: neither error nor timing may reveal it exists
        const isPasswordValid = await this.passwordHasher.compare(
            data.password,
            user?.password ?? LOGIN_TIMING_DECOY_HASH,
        );

        if (!user || !isPasswordValid) {
            throw new UnauthorizedError(ERROR_CODES.INVALID_LOGIN_OR_PASSWORD);
        }

        const token = this.tokenService.generate(user.id, user.session_version);

        return { token };
    }
}
