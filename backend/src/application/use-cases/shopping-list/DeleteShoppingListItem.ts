import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { ShoppingListRepository } from "domain/repositories/ShoppingListRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class DeleteShoppingListItem {
    constructor(
        private shoppingListRepository: Pick<
            ShoppingListRepository,
            "deleteItem"
        >,
    ) {}

    async execute(
        personId: string | number,
        itemId: string | number,
    ): Promise<void> {
        const validPersonId = validate(idSchema, personId);
        const validItemId = validate(idSchema, itemId);

        const deleted = await this.shoppingListRepository.deleteItem(
            validPersonId,
            validItemId,
        );

        if (!deleted) {
            throw new NotFoundError(ERROR_CODES.SHOPPING_LIST_ITEM_NOT_FOUND);
        }
    }
}
