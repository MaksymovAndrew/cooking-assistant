import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import { MEDIA_FILE_NAME_PATTERN } from "application/media/mediaFiles";
import type { MediaStorage } from "application/ports/MediaStorage";

export default class GetMediaFile {
    constructor(private mediaStorage: Pick<MediaStorage, "locate">) {}

    // any name outside the generated pattern is simply "not found": it never reaches the storage
    async execute(fileName: string): Promise<string> {
        const file = MEDIA_FILE_NAME_PATTERN.test(fileName)
            ? await this.mediaStorage.locate(fileName)
            : null;

        if (!file) {
            throw new NotFoundError(ERROR_CODES.MEDIA_NOT_FOUND);
        }

        return file;
    }
}
