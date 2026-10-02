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
import PurchaseHistoryController from "controller/purchaseHistory.controller";
import UserIngredientsController from "controller/userIngredients.controller";

export interface PantryControllerDeps {
    pantryRepository: PantryRepository;
    ingredientRepository: IngredientRepository;
    pantryConsumptionRepository: PantryConsumptionRepository;
    calorieRepository: CalorieRepository;
}

export interface PantryControllers {
    userIngredientsController: UserIngredientsController;
    purchaseHistoryController: PurchaseHistoryController;
    pantryConsumptionController: PantryConsumptionController;
}

export function buildPantryControllers({
    pantryRepository,
    ingredientRepository,
    pantryConsumptionRepository,
    calorieRepository,
}: PantryControllerDeps): PantryControllers {
    return {
        userIngredientsController: new UserIngredientsController({
            getUserIngredients: new GetUserIngredients(pantryRepository),
            addUserIngredients: new AddUserIngredients(
                pantryRepository,
                ingredientRepository,
            ),
            deleteUserIngredient: new DeleteUserIngredient(pantryRepository),
        }),
        purchaseHistoryController: new PurchaseHistoryController({
            updatePurchaseQuantity: new UpdatePurchaseQuantity(
                pantryRepository,
            ),
            getPurchaseHistory: new GetPurchaseHistory(pantryRepository),
            deletePurchase: new DeletePurchase(pantryRepository),
            discardPurchases: new DiscardPurchases(pantryRepository),
        }),
        pantryConsumptionController: new PantryConsumptionController({
            cookRecord: new CookRecord(
                pantryConsumptionRepository,
                calorieRepository,
            ),
            undoCooking: new UndoCooking(pantryConsumptionRepository),
        }),
    };
}
