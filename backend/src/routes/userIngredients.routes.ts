import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type PantryConsumptionController from "controller/pantryConsumption.controller";
import type UserIngredientsController from "controller/userIngredients.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createUserIngredientsRouter(
    userIngredientsController: UserIngredientsController,
    pantryConsumptionController: PantryConsumptionController,
    { authenticateToken }: SessionAuth,
): Router {
    const router = express.Router();

    // the user always comes from the auth cookie, never from the path

    router.get(
        ROUTES.userIngredients.list,
        authenticateToken,
        userIngredientsController.getUserIngredients,
    );

    router.put(
        ROUTES.userIngredients.list,
        authenticateToken,
        userIngredientsController.updateUserIngredients,
    );

    router.put(
        ROUTES.userIngredients.purchase,
        authenticateToken,
        userIngredientsController.updatePurchaseQuantity,
    );

    router.post(
        ROUTES.userIngredients.discard,
        authenticateToken,
        userIngredientsController.discardPurchases,
    );

    router.post(
        ROUTES.userIngredients.cook,
        authenticateToken,
        pantryConsumptionController.cookRecord,
    );

    router.post(
        ROUTES.userIngredients.undoCook,
        authenticateToken,
        pantryConsumptionController.undoCooking,
    );

    router.delete(
        ROUTES.userIngredients.purchase,
        authenticateToken,
        userIngredientsController.deletePurchase,
    );

    router.get(
        ROUTES.userIngredients.purchaseHistory,
        authenticateToken,
        userIngredientsController.getPurchaseHistory,
    );

    router.delete(
        ROUTES.userIngredients.byIngredient,
        authenticateToken,
        userIngredientsController.deleteUserIngredient,
    );

    return router;
}
