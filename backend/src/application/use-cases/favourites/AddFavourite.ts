import { ERROR_CODES, type ErrorCode } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type {
    FavouriteRepository,
    FavouriteTarget,
} from "domain/repositories/FavouriteRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

const NOT_FOUND_BY_TARGET = {
    recipe: ERROR_CODES.RECIPE_NOT_FOUND,
    menu: ERROR_CODES.MENU_NOT_FOUND,
} satisfies Record<FavouriteTarget, ErrorCode>;

export default class AddFavourite {
    constructor(
        private favouriteRepository: Pick<FavouriteRepository, "add">,
        private target: FavouriteTarget,
    ) {}

    async execute(
        personId: string | number,
        targetId: string | number,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validTargetId = validate(idSchema, targetId);

        const found = await this.favouriteRepository.add(
            validPersonId,
            this.target,
            validTargetId,
        );

        if (!found) {
            throw new NotFoundError(NOT_FOUND_BY_TARGET[this.target]);
        }
    }
}
