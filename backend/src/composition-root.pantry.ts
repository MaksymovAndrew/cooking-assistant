import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { PantryRepository } from "domain/repositories/PantryRepository";

import AddUserIngredients from "application/use-cases/pantry/AddUserIngredients";
import DeleteUserIngredient from "application/use-cases/pantry/DeleteUserIngredient";
import GetPurchaseHistory from "application/use-cases/pantry/GetPurchaseHistory";
import GetUserIngredients from "application/use-cases/pantry/GetUserIngredients";
import UpdateIngredientQuantities from "application/use-cases/pantry/UpdateIngredientQuantities";
import UpdatePurchaseQuantity from "application/use-cases/pantry/UpdatePurchaseQuantity";

import UserIngredientsController from "controller/userIngredients.controller";

// split out of composition-root.ts, which hit the file's line-count lint cap once this was inlined
export interface PantryControllerDeps {
    pantryRepository: PantryRepository;
    ingredientRepository: IngredientRepository;
}

export function buildPantryController({
    pantryRepository,
    ingredientRepository,
}: PantryControllerDeps): UserIngredientsController {
    return new UserIngredientsController({
        getUserIngredients: new GetUserIngredients(pantryRepository),
        addUserIngredients: new AddUserIngredients(
            pantryRepository,
            ingredientRepository,
        ),
        deleteUserIngredient: new DeleteUserIngredient(pantryRepository),
        updateIngredientQuantities: new UpdateIngredientQuantities(
            pantryRepository,
            ingredientRepository,
        ),
        updatePurchaseQuantity: new UpdatePurchaseQuantity(pantryRepository),
        getPurchaseHistory: new GetPurchaseHistory(pantryRepository),
    });
}
