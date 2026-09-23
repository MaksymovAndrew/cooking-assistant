import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type PhotoController from "controller/photo.controller";
import { readImageBody } from "middleware/imageUpload";
import type { SessionAuth } from "middleware/jwtMiddleware";
import { uploadLimiter } from "middleware/rateLimit";

// authentication and the quota run before the body is read, so an anonymous or throttled client
// never gets to stream ten megabytes at us
export default function createPhotoRouter(
    photoController: PhotoController,
    { authenticateToken }: SessionAuth,
): Router {
    const router = express.Router();
    const upload = [authenticateToken, uploadLimiter, ...readImageBody];

    router.put(
        ROUTES.recipes.photo,
        ...upload,
        photoController.uploadRecipePhoto,
    );
    router.delete(
        ROUTES.recipes.photo,
        authenticateToken,
        photoController.removeRecipePhoto,
    );

    router.put(ROUTES.menu.photo, ...upload, photoController.uploadMenuPhoto);
    router.delete(
        ROUTES.menu.photo,
        authenticateToken,
        photoController.removeMenuPhoto,
    );

    router.put(
        ROUTES.auth.avatar,
        ...upload,
        photoController.uploadAvatarPhoto,
    );
    router.delete(
        ROUTES.auth.avatar,
        authenticateToken,
        photoController.removeAvatarPhoto,
    );

    return router;
}
