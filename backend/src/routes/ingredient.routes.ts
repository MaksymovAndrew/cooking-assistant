import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type IngredientController from "controller/ingredient.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createIngredientRouter(
    ingredientController: IngredientController,
    { optionalAuth }: SessionAuth,
): Router {
    const router = express.Router();

    router.get(
        ROUTES.ingredients.list,
        optionalAuth,
        ingredientController.getAll,
    );

    return router;
}
