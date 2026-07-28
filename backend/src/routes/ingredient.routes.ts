import express, { type Router } from "express";

import type IngredientController from "controller/ingredient.controller";
import authenticateToken from "middleware/jwtMiddleware";

export default function createIngredientRouter(
    ingredientController: IngredientController,
): Router {
    const router = express.Router();

    router.get("/ingredients", authenticateToken, ingredientController.getAll);

    return router;
}
