import express, { type Router } from "express";

import type UserIngredientsController from "controller/userIngredients.controller";
import authenticateToken from "middleware/jwtMiddleware";

export default function createUserIngredientsRouter(
    userIngredientsController: UserIngredientsController,
): Router {
    const router = express.Router();

    // the user always comes from the auth cookie, never from the path

    router.get(
        "/user-ingredients",
        authenticateToken,
        userIngredientsController.getUserIngredients,
    );

    router.put(
        "/user-ingredients",
        authenticateToken,
        userIngredientsController.updateUserIngredients,
    );

    router.put(
        "/user-ingredients/history/:purchaseId",
        authenticateToken,
        userIngredientsController.updatePurchaseQuantity,
    );

    router.get(
        "/user-ingredients/history/:ingredientId",
        authenticateToken,
        userIngredientsController.getPurchaseHistory,
    );

    router.delete(
        "/user-ingredients/:ingredientId",
        authenticateToken,
        userIngredientsController.deleteUserIngredient,
    );

    return router;
}
