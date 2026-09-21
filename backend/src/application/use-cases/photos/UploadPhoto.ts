import { randomUUID } from "node:crypto";

import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError, ValidationError } from "domain/errors/AppError";
import type {
    PhotoRepository,
    PhotoTarget,
} from "domain/repositories/PhotoRepository";

import { detectImageFormat } from "application/media/detectImageFormat";
import { IMAGE_VARIANTS } from "application/media/mediaFiles";
import type { ImageProcessor } from "application/ports/ImageProcessor";
import type { MediaStorage } from "application/ports/MediaStorage";
import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

import { NOT_FOUND_BY_TARGET } from "./photoTargets";

export default class UploadPhoto {
    constructor(
        private photoRepository: Pick<PhotoRepository, "replace">,
        private imageProcessor: ImageProcessor,
        private mediaStorage: Pick<MediaStorage, "save" | "remove">,
        private target: PhotoTarget,
    ) {}

    // the files are written before the record points at them, so a record never names a missing file
    async execute(
        personId: string | number,
        targetId: string | number,
        input: unknown,
    ): Promise<string> {
        const validPersonId = validate(idSchema, personId);
        const validTargetId = validate(idSchema, targetId);
        const isImage = Buffer.isBuffer(input) && detectImageFormat(input);

        if (!isImage) {
            throw new ValidationError(ERROR_CODES.MEDIA_UNSUPPORTED_TYPE);
        }

        const variants = await this.imageProcessor.toVariants(
            input,
            IMAGE_VARIANTS,
        );

        if (!variants) {
            throw new ValidationError(ERROR_CODES.MEDIA_UNREADABLE);
        }

        const key = randomUUID();

        await this.mediaStorage.save(key, variants);

        const swap = await this.photoRepository
            .replace(validPersonId, this.target, validTargetId, key)
            .catch(async (error: unknown) => {
                await this.mediaStorage.remove(key);

                throw error;
            });

        if (!swap) {
            await this.mediaStorage.remove(key);

            throw new NotFoundError(NOT_FOUND_BY_TARGET[this.target]);
        }

        if (swap.previousKey) {
            await this.mediaStorage.remove(swap.previousKey);
        }

        return key;
    }
}
