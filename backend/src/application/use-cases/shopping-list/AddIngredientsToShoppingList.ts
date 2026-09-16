import { ERROR_CODES } from "constants/errorCodes";
import { SHOPPING_LIST_LIMITS } from "constants/shoppingList";
import { ConflictError } from "domain/errors/AppError";
import type { IngredientRepository } from "domain/repositories/IngredientRepository";
import type { ShoppingListRepository } from "domain/repositories/ShoppingListRepository";

import { assertIngredientsExist } from "application/validation/assertIngredientsExist";
import { idSchema } from "application/validation/common.schemas";
import { addIngredientsToShoppingListSchema } from "application/validation/shoppingList.schemas";
import { validate } from "application/validation/validate";

export default class AddIngredientsToShoppingList {
    constructor(
        private shoppingListRepository: Pick<
            ShoppingListRepository,
            "addIngredients"
        >,
        private ingredientRepository: Pick<
            IngredientRepository,
            "findExistingIds"
        >,
    ) {}

    async execute(personId: string | number, input: unknown): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const { items } = validate(addIngredientsToShoppingListSchema, input);

        await assertIngredientsExist(
            this.ingredientRepository,
            items.map((item) => item.ingredient_id),
        );

        const added = await this.shoppingListRepository.addIngredients(
            validPersonId,
            items,
            SHOPPING_LIST_LIMITS.MAX_ITEMS,
        );

        if (!added) {
            throw new ConflictError(ERROR_CODES.SHOPPING_LIST_LIMIT_REACHED);
        }
    }
}
