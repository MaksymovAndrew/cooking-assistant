import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { PantryRepository } from "domain/repositories/PantryRepository";

import { assertIngredientsExist } from "application/validation/assertIngredientsExist";
import { idSchema } from "application/validation/common.schemas";
import { pantryUpdateIngredientsSchema } from "application/validation/pantry.schemas";
import { validate } from "application/validation/validate";

export default class UpdateIngredientQuantities {
    constructor(
        private pantryRepository: Pick<PantryRepository, "updateQuantities">,
        private ingredientRepository: Pick<
            IngredientRepository,
            "findExistingIds"
        >,
    ) {}

    async execute(
        userId: string | number,
        updatedIngredients: unknown,
    ): Promise<void> {
        const validUserId = validate(idSchema, userId);
        const data = validate(
            pantryUpdateIngredientsSchema,
            updatedIngredients,
        );

        // updateQuantities upserts on an increase, so an id that doesn't exist would otherwise
        // reach the same FK violation AddUserIngredients guards against
        await assertIngredientsExist(
            this.ingredientRepository,
            data.map((ingredient) => ingredient.id),
        );

        await this.pantryRepository.updateQuantities(validUserId, data);
    }
}
