import { ERROR_MESSAGES } from "constants/errorMessages";
import { ValidationError } from "domain/errors/AppError";

// raw request shape; validation unifies both quantity field names into quantity_recipe_ingredients
export interface RecipeIngredientInput {
    id: number;
    quantity?: number;
    quantity_recipe_ingredients?: number;
}

export interface RecipeIngredient {
    id: number;
    quantity_recipe_ingredients: number;
}

export interface RecipeCreationInput {
    title?: string;
    content?: string;
    person_id?: number;
    ingredients: RecipeIngredientInput[];
    type_id?: number;
    cooking_time?: number;
    // manual per-portion calorie value; undefined/null means "compute it from the ingredients"
    calories_override?: number | null;
}

export type RecipeUpdateInput = Omit<RecipeCreationInput, "person_id">;

export type RecipeCreationData = Omit<RecipeCreationInput, "ingredients"> & {
    ingredients: RecipeIngredient[];
};

export type RecipeUpdateData = Omit<RecipeCreationData, "person_id">;

function validateIngredients(ingredients: RecipeIngredient[]): void {
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        throw new ValidationError(ERROR_MESSAGES.RECIPE_INGREDIENTS_EMPTY);
    }

    for (const ingredient of ingredients) {
        if (!ingredient.id) {
            throw new ValidationError(ERROR_MESSAGES.RECIPE_INGREDIENTS_NO_ID);
        }
    }
}

export class Recipe {
    declare title?: string;
    declare content?: string;
    declare person_id?: number;
    declare ingredients: RecipeIngredient[];
    declare type_id?: number;
    declare cooking_time?: number;
    declare calories_override?: number | null;

    static forCreation({
        title,
        content,
        person_id,
        ingredients,
        type_id,
        cooking_time,
        calories_override,
    }: RecipeCreationData): Recipe {
        validateIngredients(ingredients);

        return new Recipe({
            title,
            content,
            person_id,
            ingredients,
            type_id,
            cooking_time,
            calories_override,
        });
    }

    static forUpdate({
        title,
        content,
        ingredients,
        type_id,
        cooking_time,
        calories_override,
    }: RecipeUpdateData): Recipe {
        if (!title || !content) {
            throw new ValidationError(
                ERROR_MESSAGES.RECIPE_TITLE_CONTENT_EMPTY,
            );
        }

        validateIngredients(ingredients);

        return new Recipe({
            title,
            content,
            ingredients,
            type_id,
            cooking_time,
            calories_override,
        });
    }

    private constructor(data: Partial<Recipe>) {
        Object.assign(this, data);
    }
}

export default Recipe;
