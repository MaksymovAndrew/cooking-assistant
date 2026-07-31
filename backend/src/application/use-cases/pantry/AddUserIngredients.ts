import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { PantryRepository } from "domain/repositories/PantryRepository";

import { assertIngredientsExist } from "application/validation/assertIngredientsExist";
import { idSchema } from "application/validation/common.schemas";
import { pantryIngredientsSchema } from "application/validation/pantry.schemas";
import { validate } from "application/validation/validate";

export default class AddUserIngredients {
    constructor(
        private pantryRepository: Pick<PantryRepository, "addIngredients">,
        private ingredientRepository: Pick<
            IngredientRepository,
            "findExistingIds"
        >,
    ) {}

    async execute(
        userId: string | number,
        ingredients: unknown,
    ): Promise<void> {
        const validUserId = validate(idSchema, userId);
        const data = validate(pantryIngredientsSchema, ingredients);

        await assertIngredientsExist(
            this.ingredientRepository,
            data.map((ingredient) => ingredient.id),
        );

        await this.pantryRepository.addIngredients(validUserId, data);
    }
}
