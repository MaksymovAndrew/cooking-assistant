import express, { type Router } from "express";

import type MenuController from "controller/menu.controller";
import authenticateToken from "middleware/jwtMiddleware";

export default function createMenuRouter(
    menuController: MenuController,
): Router {
    const router = express.Router();

    router.get("/menu", authenticateToken, menuController.getAll);

    router.get("/menus", authenticateToken, menuController.getAllUnpaginated);

    router.post("/create-menu", authenticateToken, menuController.create);

    router.get("/menu/:id", authenticateToken, menuController.getById);

    router.put("/menu/:id", authenticateToken, menuController.update);

    router.delete("/menu/:id", authenticateToken, menuController.remove);

    router.get(
        "/menu-filters-person",
        authenticateToken,
        menuController.searchByPerson,
    );

    return router;
}
