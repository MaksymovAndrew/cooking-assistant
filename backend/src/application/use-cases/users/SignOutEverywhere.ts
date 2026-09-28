import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { UserRepository } from "domain/repositories/UserRepository";

import type { TokenService } from "application/ports/TokenService";

export default class SignOutEverywhere {
    constructor(
        private userRepository: Pick<UserRepository, "revokeSessions">,
        private tokenService: Pick<TokenService, "generate">,
    ) {}

    // every other session ends; the one that asked gets a fresh token and stays signed in
    async execute(userId: number): Promise<{ token: string }> {
        const sessionVersion = await this.userRepository.revokeSessions(userId);

        if (sessionVersion === null) {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }

        return { token: this.tokenService.generate(userId, sessionVersion) };
    }
}
