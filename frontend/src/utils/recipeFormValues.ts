import { MINUTES_PER_HOUR } from "constants/time";
import type {
    CreateRecipeRequest,
    RecipeDetails,
    UpdateRecipeRequest,
} from "types/recipe";
import type { RecipeFormInitialValues } from "types/recipeForm";

import { splitCookingTime } from "utils/cookingTimeUtils";

export const recipeToFormValues = (
    recipe: RecipeDetails,
): RecipeFormInitialValues => {
    const { hours, minutes } = splitCookingTime(recipe.cooking_time ?? 0);

    return {
        title: recipe.title,
        content: recipe.content,
        language: recipe.language,
        cookingHours: String(hours),
        cookingMinutes: String(minutes),
        selectedTypeId: recipe.type_id,
        selectedIngredients: recipe.ingredients.map((ingredient) => ({
            id: ingredient.id,
            slug: ingredient.slug,
            name: ingredient.name,
            quantity: ingredient.quantity_recipe_ingredients,
            unit_name: ingredient.unit_name,
            calories_per_unit: ingredient.calories_per_unit,
        })),
        caloriesOverride:
            recipe.calories_override === null
                ? ""
                : String(recipe.calories_override),
        photoKey: recipe.photo_key,
    };
};

type RecipeFormFields = Omit<RecipeFormInitialValues, "photoKey">;

const recipeRequestFields = (values: RecipeFormFields) => ({
    title: values.title,
    content: values.content,
    language: values.language,
    type_id: values.selectedTypeId,
    cooking_time:
        Number(values.cookingHours) * MINUTES_PER_HOUR +
        Number(values.cookingMinutes),
    calories_override:
        values.caloriesOverride === "" ? null : Number(values.caloriesOverride),
});

export const formValuesToCreateRequest = (
    values: RecipeFormFields,
): CreateRecipeRequest => ({
    ...recipeRequestFields(values),
    ingredients: values.selectedIngredients.map(({ id, quantity }) => ({
        id,
        quantity,
    })),
});

// the update endpoint names an ingredient's amount after its column
export const formValuesToUpdateRequest = (
    values: RecipeFormFields,
): UpdateRecipeRequest => ({
    ...recipeRequestFields(values),
    ingredients: values.selectedIngredients.map(({ id, quantity }) => ({
        id,
        quantity_recipe_ingredients: quantity,
    })),
});
