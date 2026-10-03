import type { UserRepository } from "domain/repositories/UserRepository";

import { updateLocaleSchema } from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

export default class UpdateLocale {
    constructor(private userRepository: Pick<UserRepository, "updateLocale">) {}

    async execute(userId: number, input: unknown): Promise<void> {
        const { locale } = validate(updateLocaleSchema, input);

        await this.userRepository.updateLocale(userId, locale);
    }
}
