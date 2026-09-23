import { NotFoundError } from "domain/errors/AppError";
import type {
    PhotoRepository,
    PhotoTarget,
} from "domain/repositories/PhotoRepository";

import type { MediaStorage } from "application/ports/MediaStorage";
import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

import { NOT_FOUND_BY_TARGET } from "./photoTargets";

export default class RemovePhoto {
    constructor(
        private photoRepository: Pick<PhotoRepository, "replace">,
        private mediaStorage: Pick<MediaStorage, "remove">,
        private target: PhotoTarget,
    ) {}

    async execute(
        personId: string | number,
        targetId: string | number,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validTargetId = validate(idSchema, targetId);
        const swap = await this.photoRepository.replace(
            validPersonId,
            this.target,
            validTargetId,
            null,
        );

        if (!swap) {
            throw new NotFoundError(NOT_FOUND_BY_TARGET[this.target]);
        }

        if (swap.previousKey) {
            await this.mediaStorage.remove(swap.previousKey);
        }
    }
}
