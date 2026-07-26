import { ERROR_MESSAGES } from "constants/errorMessages";
import Recipe from "domain/entities/Recipe";
import { NotFoundError } from "domain/errors/AppError";
import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import { assertIngredientsExist } from "application/validation/assertIngredientsExist";
import { idSchema } from "application/validation/common.schemas";
import { updateRecipeSchema } from "application/validation/recipe.schemas";
import { validate } from "application/validation/validate";

export default class UpdateRecipe {
    constructor(
        private recipeRepository: Pick<RecipeRepository, "update">,
        private ingredientRepository: Pick<
            IngredientRepository,
            "findExistingIds"
        >,
    ) {}

    async execute(
        id: string | number,
        personId: number,
        input: unknown,
    ): Promise<unknown> {
        const recipeId = validate(idSchema, id);
        const validPersonId = validate(idSchema, personId);
        const data = validate(updateRecipeSchema, input);
        const recipe = Recipe.forUpdate(data);

        await assertIngredientsExist(
            this.ingredientRepository,
            data.ingredients.map((ingredient) => ingredient.id),
        );

        const updated = await this.recipeRepository.update(
            recipeId,
            validPersonId,
            recipe,
        );

        if (!updated) {
            throw new NotFoundError(ERROR_MESSAGES.RECIPE_NOT_FOUND);
        }

        return updated;
    }
}
