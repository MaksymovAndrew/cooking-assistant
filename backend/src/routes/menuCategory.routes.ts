import express, { type Router } from "express";

import type MenuCategoryController from "controller/menuCategory.controller";
import optionalAuth from "middleware/optionalAuth";

export default function createMenuCategoryRouter(
    menuCategoryController: MenuCategoryController,
): Router {
    const router = express.Router();

    router.get("/menu-categories", optionalAuth, menuCategoryController.getAll);

    return router;
}
