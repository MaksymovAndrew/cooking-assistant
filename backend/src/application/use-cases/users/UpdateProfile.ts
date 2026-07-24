import type { UserRepository } from "domain/repositories/UserRepository";

import { updateProfileSchema } from "application/validation/user.schemas";
import { validate } from "application/validation/validate";

export default class UpdateProfile {
    constructor(
        private userRepository: Pick<UserRepository, "updateProfile">,
    ) {}

    async execute(userId: number, input: unknown): Promise<void> {
        const data = validate(updateProfileSchema, input);

        await this.userRepository.updateProfile(userId, data);
    }
}
