import { ERROR_CODES } from "constants/errorCodes";
import { ConflictError } from "domain/errors/AppError";
import type { ShoppingListRepository } from "domain/repositories/ShoppingListRepository";

import { idSchema } from "application/validation/common.schemas";
import { reorderShoppingListSchema } from "application/validation/shoppingList.schemas";
import { validate } from "application/validation/validate";

export default class ReorderShoppingList {
    constructor(
        private shoppingListRepository: Pick<ShoppingListRepository, "reorder">,
    ) {}

    async execute(personId: string | number, input: unknown): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const { ids } = validate(reorderShoppingListSchema, input);

        const reordered = await this.shoppingListRepository.reorder(
            validPersonId,
            ids,
        );

        if (!reordered) {
            throw new ConflictError(
                ERROR_CODES.SHOPPING_LIST_ORDER_OUT_OF_DATE,
            );
        }
    }
}
