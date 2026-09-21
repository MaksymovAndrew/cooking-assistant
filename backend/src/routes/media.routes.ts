import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type MediaController from "controller/media.controller";

export default function createMediaRouter(
    mediaController: MediaController,
): Router {
    const router = express.Router();

    router.get(ROUTES.media.file, mediaController.serve);

    return router;
}
