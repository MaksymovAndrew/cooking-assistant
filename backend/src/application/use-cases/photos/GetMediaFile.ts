import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";

import { contentTypeOf, variantOfFileName } from "application/media/mediaFiles";
import type { MediaStorage } from "application/ports/MediaStorage";

export interface MediaFile {
    path: string;
    // from our own naming scheme, never from the request or the file's contents
    contentType: string;
}

export default class GetMediaFile {
    constructor(private mediaStorage: Pick<MediaStorage, "locate">) {}

    // any name outside the generated pattern is simply "not found": it never reaches the storage
    async execute(fileName: string): Promise<MediaFile> {
        const variant = variantOfFileName(fileName);
        const path = variant ? await this.mediaStorage.locate(fileName) : null;

        if (!variant || !path) {
            throw new NotFoundError(ERROR_CODES.MEDIA_NOT_FOUND);
        }

        return { path, contentType: contentTypeOf(variant) };
    }
}
