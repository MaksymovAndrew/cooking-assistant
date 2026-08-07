import express, { type Router } from "express";

import type RecipeTypeController from "controller/type.controller";
import optionalAuth from "middleware/optionalAuth";

export default function createTypeRouter(
    recipeTypeController: RecipeTypeController,
): Router {
    const router = express.Router();

    router.get("/recipe-types", optionalAuth, recipeTypeController.getAll);

    return router;
}
