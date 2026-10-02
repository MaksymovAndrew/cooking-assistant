import Recipe from "domain/entities/Recipe";
import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";
import type { RecipeTypeRepository } from "domain/repositories/RecipeTypeRepository";

import { assertIngredientsExist } from "application/validation/assertIngredientsExist";
import { assertRecipeTypeExists } from "application/validation/assertReferenceExists";
import { createRecipeSchema } from "application/validation/recipe.schemas";
import { validate } from "application/validation/validate";

export default class CreateRecipe {
    constructor(
        private recipeRepository: Pick<RecipeRepository, "create">,
        private ingredientRepository: Pick<
            IngredientRepository,
            "findExistingIds"
        >,
        private recipeTypeRepository: Pick<RecipeTypeRepository, "exists">,
    ) {}

    async execute(input: unknown): Promise<unknown> {
        const data = validate(createRecipeSchema, input);
        const recipe = Recipe.forCreation(data);

        await assertIngredientsExist(
            this.ingredientRepository,
            data.ingredients.map((ingredient) => ingredient.id),
        );
        await assertRecipeTypeExists(this.recipeTypeRepository, data.type_id);

        return this.recipeRepository.create(recipe);
    }
}
