import type { RequestHandler } from "express";

import { MEDIA_RESPONSE_HEADERS } from "config/security";

import type GetMediaFile from "application/use-cases/photos/GetMediaFile";

export default class MediaController {
    constructor(private getMediaFileUseCase: GetMediaFile) {}

    serve: RequestHandler<{ file: string }> = async (req, res) => {
        const { path, contentType } = await this.getMediaFileUseCase.execute(
            req.params.file,
        );

        res.set(MEDIA_RESPONSE_HEADERS);
        res.type(contentType);
        res.sendFile(path, { dotfiles: "deny", cacheControl: false });
    };
}
