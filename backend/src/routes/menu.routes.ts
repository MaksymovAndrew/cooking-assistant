import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type MenuController from "controller/menu.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createMenuRouter(
    menuController: MenuController,
    { authenticateToken, optionalAuth }: SessionAuth,
): Router {
    const router = express.Router();

    router.get(ROUTES.menu.list, optionalAuth, menuController.getAll);

    router.get(
        ROUTES.menu.allUnpaginated,
        authenticateToken,
        menuController.getAllUnpaginated,
    );

    router.post(ROUTES.menu.create, authenticateToken, menuController.create);

    router.get(ROUTES.menu.byId, optionalAuth, menuController.getById);

    router.put(ROUTES.menu.byId, authenticateToken, menuController.update);

    router.delete(ROUTES.menu.byId, authenticateToken, menuController.remove);

    router.get(
        ROUTES.menu.byPerson,
        authenticateToken,
        menuController.searchByPerson,
    );

    return router;
}
