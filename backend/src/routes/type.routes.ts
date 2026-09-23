import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type RecipeTypeController from "controller/type.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createTypeRouter(
    recipeTypeController: RecipeTypeController,
    { optionalAuth }: SessionAuth,
): Router {
    const router = express.Router();

    router.get(
        ROUTES.recipeTypes.list,
        optionalAuth,
        recipeTypeController.getAll,
    );

    return router;
}
