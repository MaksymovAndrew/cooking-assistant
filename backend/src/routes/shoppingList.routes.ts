import express, { type Router } from "express";

import { ROUTES } from "constants/routes";

import type ShoppingListController from "controller/shoppingList.controller";
import type { SessionAuth } from "middleware/jwtMiddleware";

export default function createShoppingListRouter(
    shoppingListController: ShoppingListController,
    { authenticateToken }: SessionAuth,
): Router {
    const router = express.Router();

    router.get(
        ROUTES.shoppingList.list,
        authenticateToken,
        shoppingListController.getShoppingList,
    );

    router.post(
        ROUTES.shoppingList.list,
        authenticateToken,
        shoppingListController.addShoppingListItem,
    );

    router.post(
        ROUTES.shoppingList.ingredients,
        authenticateToken,
        shoppingListController.addIngredientsToShoppingList,
    );

    router.put(
        ROUTES.shoppingList.order,
        authenticateToken,
        shoppingListController.reorderShoppingList,
    );

    // registered ahead of byId, which would otherwise capture "checked" as an item id
    router.delete(
        ROUTES.shoppingList.checked,
        authenticateToken,
        shoppingListController.clearCheckedShoppingListItems,
    );

    router.patch(
        ROUTES.shoppingList.byId,
        authenticateToken,
        shoppingListController.updateShoppingListItem,
    );

    router.delete(
        ROUTES.shoppingList.byId,
        authenticateToken,
        shoppingListController.deleteShoppingListItem,
    );

    return router;
}
