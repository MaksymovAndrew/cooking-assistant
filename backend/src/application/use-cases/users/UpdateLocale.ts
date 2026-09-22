import type { UserRepository } from "domain/repositories/UserRepository";

import { updateLocaleSchema } from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

// the account's language - what its emails are written in, and what the app shows on any device it signs in on
export default class UpdateLocale {
    constructor(private userRepository: Pick<UserRepository, "updateLocale">) {}

    async execute(userId: number, input: unknown): Promise<void> {
        const { locale } = validate(updateLocaleSchema, input);

        await this.userRepository.updateLocale(userId, locale);
    }
}
