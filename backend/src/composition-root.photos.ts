import type {
    PhotoRepository,
    PhotoTarget,
} from "domain/repositories/PhotoRepository";

import type { ImageProcessor } from "application/ports/ImageProcessor";
import type { MediaStorage } from "application/ports/MediaStorage";
import GetMediaFile from "application/use-cases/photos/GetMediaFile";
import RemovePhoto from "application/use-cases/photos/RemovePhoto";
import UploadPhoto from "application/use-cases/photos/UploadPhoto";

import MediaController from "controller/media.controller";
import PhotoController from "controller/photo.controller";

export interface PhotoControllers {
    photoController: PhotoController;
    mediaController: MediaController;
}

export interface PhotoControllerDeps {
    photoRepository: PhotoRepository;
    imageProcessor: ImageProcessor;
    mediaStorage: MediaStorage;
}

export function buildPhotoControllers({
    photoRepository,
    imageProcessor,
    mediaStorage,
}: PhotoControllerDeps): PhotoControllers {
    const upload = (target: PhotoTarget) =>
        new UploadPhoto(photoRepository, imageProcessor, mediaStorage, target);
    const remove = (target: PhotoTarget) =>
        new RemovePhoto(photoRepository, mediaStorage, target);

    return {
        photoController: new PhotoController({
            uploadRecipePhoto: upload("recipe"),
            removeRecipePhoto: remove("recipe"),
            uploadMenuPhoto: upload("menu"),
            removeMenuPhoto: remove("menu"),
            uploadAvatarPhoto: upload("avatar"),
            removeAvatarPhoto: remove("avatar"),
        }),
        mediaController: new MediaController(new GetMediaFile(mediaStorage)),
    };
}
