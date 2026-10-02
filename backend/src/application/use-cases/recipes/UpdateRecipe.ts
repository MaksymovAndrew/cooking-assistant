import { ERROR_CODES } from "constants/errorCodes";
import Recipe from "domain/entities/Recipe";
import { NotFoundError } from "domain/errors/AppError";
import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";
import type { RecipeTypeRepository } from "domain/repositories/RecipeTypeRepository";

import { assertIngredientsExist } from "application/validation/assertIngredientsExist";
import { assertRecipeTypeExists } from "application/validation/assertReferenceExists";
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
        private recipeTypeRepository: Pick<RecipeTypeRepository, "exists">,
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
        await assertRecipeTypeExists(this.recipeTypeRepository, data.type_id);

        const updated = await this.recipeRepository.update(
            recipeId,
            validPersonId,
            recipe,
        );

        if (!updated) {
            throw new NotFoundError(ERROR_CODES.RECIPE_NOT_FOUND);
        }

        return updated;
    }
}
