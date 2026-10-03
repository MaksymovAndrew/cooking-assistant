import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type PantryConsumptionController from "controller/pantryConsumption.controller";
import type PurchaseHistoryController from "controller/purchaseHistory.controller";
import type UserIngredientsController from "controller/userIngredients.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

interface PantryRouterControllers {
    userIngredientsController: UserIngredientsController;
    purchaseHistoryController: PurchaseHistoryController;
    pantryConsumptionController: PantryConsumptionController;
}

export default function createUserIngredientsRouter(
    {
        userIngredientsController,
        purchaseHistoryController,
        pantryConsumptionController,
    }: PantryRouterControllers,
    { authenticateToken }: SessionAuth,
): Router {
    const router = express.Router();

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
        purchaseHistoryController.updatePurchaseQuantity,
    );

    router.post(
        ROUTES.userIngredients.discard,
        authenticateToken,
        purchaseHistoryController.discardPurchases,
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
        purchaseHistoryController.deletePurchase,
    );

    router.get(
        ROUTES.userIngredients.purchaseHistory,
        authenticateToken,
        purchaseHistoryController.getPurchaseHistory,
    );

    router.delete(
        ROUTES.userIngredients.byIngredient,
        authenticateToken,
        userIngredientsController.deleteUserIngredient,
    );

    return router;
}
