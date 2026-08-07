import express, { type Router } from "express";

import type IngredientController from "controller/ingredient.controller";
import optionalAuth from "middleware/optionalAuth";

export default function createIngredientRouter(
    ingredientController: IngredientController,
): Router {
    const router = express.Router();

    router.get("/ingredients", optionalAuth, ingredientController.getAll);

    return router;
}
