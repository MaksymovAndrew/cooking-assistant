import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type RatingController from "controller/rating.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createRatingRouter(
    ratingController: RatingController,
    { authenticateToken }: SessionAuth,
): Router {
    const router = express.Router();

    router.put(
        ROUTES.recipes.rating,
        authenticateToken,
        ratingController.rateRecipe,
    );

    router.delete(
        ROUTES.recipes.rating,
        authenticateToken,
        ratingController.removeRecipeRating,
    );

    router.put(
        ROUTES.menu.rating,
        authenticateToken,
        ratingController.rateMenu,
    );

    router.delete(
        ROUTES.menu.rating,
        authenticateToken,
        ratingController.removeMenuRating,
    );

    return router;
}
