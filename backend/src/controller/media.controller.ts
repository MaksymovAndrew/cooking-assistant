import type { RequestHandler } from "express";

import { MEDIA_RESPONSE_HEADERS } from "config/security";

import { MEDIA_CONTENT_TYPE } from "application/media/mediaFiles";
import type GetMediaFile from "application/use-cases/photos/GetMediaFile";

export default class MediaController {
    constructor(private getMediaFileUseCase: GetMediaFile) {}

    // the type comes from our own naming scheme, never from the request or the file's contents
    serve: RequestHandler<{ file: string }> = async (req, res) => {
        const file = await this.getMediaFileUseCase.execute(req.params.file);

        res.set(MEDIA_RESPONSE_HEADERS);
        res.type(MEDIA_CONTENT_TYPE);
        res.sendFile(file, { dotfiles: "deny", cacheControl: false });
    };
}
