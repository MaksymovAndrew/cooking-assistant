import { ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError } from "domain/errors/AppError";
import type {
    PublicUser,
    UserRepository,
} from "domain/repositories/UserRepository";

export default class GetCurrentUser {
    constructor(private userRepository: Pick<UserRepository, "findById">) {}

    async execute(id: number): Promise<PublicUser> {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new NotFoundError(ERROR_MESSAGES.USER_NOT_FOUND);
        }

        return user;
    }
}
