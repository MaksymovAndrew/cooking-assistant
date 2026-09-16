import { ERROR_CODES } from "constants/errorCodes";
import { SHOPPING_LIST_LIMITS } from "constants/shoppingList";
import { ConflictError } from "domain/errors/AppError";
import type {
    ShoppingListItemRow,
    ShoppingListRepository,
} from "domain/repositories/ShoppingListRepository";

import { idSchema } from "application/validation/common.schemas";
import { createShoppingListItemSchema } from "application/validation/shoppingList.schemas";
import { validate } from "application/validation/validate";

export default class AddShoppingListItem {
    constructor(
        private shoppingListRepository: Pick<ShoppingListRepository, "addItem">,
    ) {}

    async execute(
        personId: string | number,
        input: unknown,
    ): Promise<ShoppingListItemRow> {
        const validPersonId = validate(idSchema, personId);
        const { name, note } = validate(createShoppingListItemSchema, input);

        const item = await this.shoppingListRepository.addItem(
            validPersonId,
            { name, note: note ?? null },
            SHOPPING_LIST_LIMITS.MAX_ITEMS,
        );

        if (!item) {
            throw new ConflictError(ERROR_CODES.SHOPPING_LIST_LIMIT_REACHED);
        }

        return item;
    }
}
