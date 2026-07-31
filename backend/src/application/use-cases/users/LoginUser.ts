import { LOGIN_TIMING_DECOY_HASH } from "config/security";
import { ERROR_CODES, ERROR_MESSAGES } from "constants/errorMessages";
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
        // same email format check as registration decides whether this identifier is looked up as an email or a username
        const asEmail = emailSchema().safeParse(data.login);
        // same error for unknown login and wrong password to prevent login enumeration
        const user = asEmail.success
            ? await this.userRepository.findCredentialsByEmail(asEmail.data)
            : await this.userRepository.findByLogin(data.login);

        // when the login doesn't exist, compare against a fixed dummy hash anyway so the response
        // takes the same time as a wrong-password rejection - otherwise the timing difference alone
        // (no bcrypt run vs. one) lets an attacker enumerate real logins despite the identical error
        const isPasswordValid = await this.passwordHasher.compare(
            data.password,
            user?.password ?? LOGIN_TIMING_DECOY_HASH,
        );

        if (!user || !isPasswordValid) {
            throw new UnauthorizedError(
                ERROR_MESSAGES.INVALID_LOGIN_OR_PASSWORD,
                ERROR_CODES.INVALID_LOGIN_OR_PASSWORD,
            );
        }

        const token = this.tokenService.generate(user.id);

        return { token };
    }
}
