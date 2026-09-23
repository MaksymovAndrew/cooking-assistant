import type { Locale } from "constants/locales";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { PasswordHasher } from "application/ports/PasswordHasher";
import type { TokenService } from "application/ports/TokenService";
import { registerUserSchema } from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

export default class RegisterUser {
    constructor(
        private userRepository: Pick<UserRepository, "create">,
        private passwordHasher: Pick<PasswordHasher, "hash">,
        private tokenService: Pick<TokenService, "generate">,
    ) {}

    async execute(input: unknown, locale: Locale): Promise<{ token: string }> {
        const data = validate(registerUserSchema, input);
        const hashedPassword = await this.passwordHasher.hash(data.password);

        const { id, session_version } = await this.userRepository.create({
            name: data.name,
            surname: data.surname,
            login: data.login,
            password: hashedPassword,
            email: data.email,
            locale,
        });

        return { token: this.tokenService.generate(id, session_version) };
    }
}
