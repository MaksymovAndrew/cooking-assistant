import type {
    FavouriteRepository,
    FavouriteTarget,
} from "domain/repositories/FavouriteRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

// idempotent: removing what isn't favourited - or a recipe or menu already deleted, whose favourites
// cascaded away with it - is simply a no-op
export default class RemoveFavourite {
    constructor(
        private favouriteRepository: Pick<FavouriteRepository, "remove">,
        private target: FavouriteTarget,
    ) {}

    async execute(
        personId: string | number,
        targetId: string | number,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validTargetId = validate(idSchema, targetId);

        await this.favouriteRepository.remove(
            validPersonId,
            this.target,
            validTargetId,
        );
    }
}
