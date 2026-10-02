import type { CalorieRepository } from "domain/repositories/CalorieRepository";
import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { PantryConsumptionRepository } from "domain/repositories/PantryConsumptionRepository";
import type { PantryRepository } from "domain/repositories/PantryRepository";

import AddUserIngredients from "application/use-cases/pantry/AddUserIngredients";
import CookRecord from "application/use-cases/pantry/CookRecord";
import DeletePurchase from "application/use-cases/pantry/DeletePurchase";
import DeleteUserIngredient from "application/use-cases/pantry/DeleteUserIngredient";
import DiscardPurchases from "application/use-cases/pantry/DiscardPurchases";
import GetPurchaseHistory from "application/use-cases/pantry/GetPurchaseHistory";
import GetUserIngredients from "application/use-cases/pantry/GetUserIngredients";
import UndoCooking from "application/use-cases/pantry/UndoCooking";
import UpdatePurchaseQuantity from "application/use-cases/pantry/UpdatePurchaseQuantity";

import PantryConsumptionController from "controller/pantryConsumption.controller";
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
        updatePurchaseQuantity: new UpdatePurchaseQuantity(pantryRepository),
        getPurchaseHistory: new GetPurchaseHistory(pantryRepository),
        deletePurchase: new DeletePurchase(pantryRepository),
        discardPurchases: new DiscardPurchases(pantryRepository),
    });
}

export interface PantryConsumptionControllerDeps {
    pantryConsumptionRepository: PantryConsumptionRepository;
    calorieRepository: CalorieRepository;
}

export function buildPantryConsumptionController({
    pantryConsumptionRepository,
    calorieRepository,
}: PantryConsumptionControllerDeps): PantryConsumptionController {
    return new PantryConsumptionController({
        cookRecord: new CookRecord(
            pantryConsumptionRepository,
            calorieRepository,
        ),
        undoCooking: new UndoCooking(pantryConsumptionRepository),
    });
}
