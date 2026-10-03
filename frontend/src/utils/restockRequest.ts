import type {
    PantryIngredient,
    SaveUserIngredientsRequest,
} from "types/userIngredient";

// the save endpoint adds to what is already there and logs the amount as a new lot
export const restockRequest = (
    ingredient: PantryIngredient,
    addedQuantity: number,
): SaveUserIngredientsRequest => ({
    ingredients: [
        {
            id: ingredient.id,
            ingredient_name:
                ingredient.ingredient_name ?? ingredient.name ?? "",
            quantity_person_ingradient: addedQuantity,
        },
    ],
});
