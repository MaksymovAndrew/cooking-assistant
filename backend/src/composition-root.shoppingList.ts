import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { ShoppingListRepository } from "domain/repositories/ShoppingListRepository";

import AddIngredientsToShoppingList from "application/use-cases/shopping-list/AddIngredientsToShoppingList";
import AddShoppingListItem from "application/use-cases/shopping-list/AddShoppingListItem";
import ClearCheckedShoppingListItems from "application/use-cases/shopping-list/ClearCheckedShoppingListItems";
import DeleteShoppingListItem from "application/use-cases/shopping-list/DeleteShoppingListItem";
import GetShoppingList from "application/use-cases/shopping-list/GetShoppingList";
import ReorderShoppingList from "application/use-cases/shopping-list/ReorderShoppingList";
import UpdateShoppingListItem from "application/use-cases/shopping-list/UpdateShoppingListItem";

import ShoppingListController from "controller/shoppingList.controller";

interface ShoppingListControllerDeps {
    shoppingListRepository: ShoppingListRepository;
    ingredientRepository: IngredientRepository;
}

export function buildShoppingListController({
    shoppingListRepository,
    ingredientRepository,
}: ShoppingListControllerDeps): ShoppingListController {
    return new ShoppingListController({
        getShoppingList: new GetShoppingList(shoppingListRepository),
        addShoppingListItem: new AddShoppingListItem(shoppingListRepository),
        updateShoppingListItem: new UpdateShoppingListItem(
            shoppingListRepository,
        ),
        deleteShoppingListItem: new DeleteShoppingListItem(
            shoppingListRepository,
        ),
        clearCheckedShoppingListItems: new ClearCheckedShoppingListItems(
            shoppingListRepository,
        ),
        reorderShoppingList: new ReorderShoppingList(shoppingListRepository),
        addIngredientsToShoppingList: new AddIngredientsToShoppingList(
            shoppingListRepository,
            ingredientRepository,
        ),
    });
}
