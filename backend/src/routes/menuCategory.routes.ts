import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type MenuCategoryController from "controller/menuCategory.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createMenuCategoryRouter(
    menuCategoryController: MenuCategoryController,
    { optionalAuth }: SessionAuth,
): Router {
    const router = express.Router();

    router.get(
        ROUTES.menuCategories.list,
        optionalAuth,
        menuCategoryController.getAll,
    );

    return router;
}
