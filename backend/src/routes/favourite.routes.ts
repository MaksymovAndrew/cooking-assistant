import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type FavouriteController from "controller/favourite.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createFavouriteRouter(
    favouriteController: FavouriteController,
    { authenticateToken }: SessionAuth,
): Router {
    const router = express.Router();

    router.put(
        ROUTES.recipes.favourite,
        authenticateToken,
        favouriteController.addRecipeFavourite,
    );

    router.delete(
        ROUTES.recipes.favourite,
        authenticateToken,
        favouriteController.removeRecipeFavourite,
    );

    router.put(
        ROUTES.menu.favourite,
        authenticateToken,
        favouriteController.addMenuFavourite,
    );

    router.delete(
        ROUTES.menu.favourite,
        authenticateToken,
        favouriteController.removeMenuFavourite,
    );

    return router;
}
