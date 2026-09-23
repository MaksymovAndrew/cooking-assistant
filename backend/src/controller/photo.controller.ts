import type { RequestHandler } from "express";

import type RemovePhoto from "application/use-cases/photos/RemovePhoto";
import type UploadPhoto from "application/use-cases/photos/UploadPhoto";

import { getUserId } from "./requestUser";

interface PhotoControllerDependencies {
    uploadRecipePhoto: UploadPhoto;
    removeRecipePhoto: RemovePhoto;
    uploadMenuPhoto: UploadPhoto;
    removeMenuPhoto: RemovePhoto;
    uploadAvatarPhoto: UploadPhoto;
    removeAvatarPhoto: RemovePhoto;
}

// an upload answers with the new key so the client can show it at once; a removal has nothing to say
export default class PhotoController {
    private uploadRecipePhotoUseCase: UploadPhoto;
    private removeRecipePhotoUseCase: RemovePhoto;
    private uploadMenuPhotoUseCase: UploadPhoto;
    private removeMenuPhotoUseCase: RemovePhoto;
    private uploadAvatarPhotoUseCase: UploadPhoto;
    private removeAvatarPhotoUseCase: RemovePhoto;

    constructor({
        uploadRecipePhoto,
        removeRecipePhoto,
        uploadMenuPhoto,
        removeMenuPhoto,
        uploadAvatarPhoto,
        removeAvatarPhoto,
    }: PhotoControllerDependencies) {
        this.uploadRecipePhotoUseCase = uploadRecipePhoto;
        this.removeRecipePhotoUseCase = removeRecipePhoto;
        this.uploadMenuPhotoUseCase = uploadMenuPhoto;
        this.removeMenuPhotoUseCase = removeMenuPhoto;
        this.uploadAvatarPhotoUseCase = uploadAvatarPhoto;
        this.removeAvatarPhotoUseCase = removeAvatarPhoto;
    }

    uploadRecipePhoto: RequestHandler<{ id: string }> = async (req, res) => {
        const photoKey = await this.uploadRecipePhotoUseCase.execute(
            getUserId(req),
            req.params.id,
            req.body,
        );

        res.json({ photo_key: photoKey });
    };

    removeRecipePhoto: RequestHandler<{ id: string }> = async (req, res) => {
        await this.removeRecipePhotoUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };

    uploadMenuPhoto: RequestHandler<{ id: string }> = async (req, res) => {
        const photoKey = await this.uploadMenuPhotoUseCase.execute(
            getUserId(req),
            req.params.id,
            req.body,
        );

        res.json({ photo_key: photoKey });
    };

    removeMenuPhoto: RequestHandler<{ id: string }> = async (req, res) => {
        await this.removeMenuPhotoUseCase.execute(
            getUserId(req),
            req.params.id,
        );

        res.status(204).end();
    };

    // an account is its own record, so the avatar's target is the requester
    uploadAvatarPhoto: RequestHandler = async (req, res) => {
        const userId = getUserId(req);
        const photoKey = await this.uploadAvatarPhotoUseCase.execute(
            userId,
            userId,
            req.body,
        );

        res.json({ photo_key: photoKey });
    };

    removeAvatarPhoto: RequestHandler = async (req, res) => {
        const userId = getUserId(req);

        await this.removeAvatarPhotoUseCase.execute(userId, userId);

        res.status(204).end();
    };
}
