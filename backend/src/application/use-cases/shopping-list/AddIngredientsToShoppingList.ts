import { ERROR_CODES } from "constants/errorCodes";
import { SHOPPING_LIST_LIMITS } from "constants/shoppingList";
import { ConflictError, NotFoundError } from "domain/errors/AppError";
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

        const outcome = await this.shoppingListRepository.addIngredients(
            validPersonId,
            items,
            SHOPPING_LIST_LIMITS.MAX_ITEMS,
        );

        if (outcome === "person_not_found") {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }

        if (outcome === "limit_reached") {
            throw new ConflictError(ERROR_CODES.SHOPPING_LIST_LIMIT_REACHED);
        }
    }
}
