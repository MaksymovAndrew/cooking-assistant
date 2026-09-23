import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type TagController from "controller/tag.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createTagRouter(
    tagController: TagController,
    { authenticateToken }: SessionAuth,
): Router {
    const router = express.Router();

    router.get(ROUTES.tags.list, authenticateToken, tagController.getTags);

    router.post(ROUTES.tags.list, authenticateToken, tagController.createTag);

    router.patch(ROUTES.tags.byId, authenticateToken, tagController.renameTag);

    router.delete(ROUTES.tags.byId, authenticateToken, tagController.deleteTag);

    router.put(
        ROUTES.recipes.tags,
        authenticateToken,
        tagController.setRecipeTags,
    );

    return router;
}
