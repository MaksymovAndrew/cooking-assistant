import { ERROR_CODES } from "constants/errorCodes";
import { SHOPPING_LIST_LIMITS } from "constants/shoppingList";
import { ConflictError, NotFoundError } from "domain/errors/AppError";
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

        const result = await this.shoppingListRepository.addItem(
            validPersonId,
            { name, note: note ?? null },
            SHOPPING_LIST_LIMITS.MAX_ITEMS,
        );

        if (result.outcome === "person_not_found") {
            throw new NotFoundError(ERROR_CODES.USER_NOT_FOUND);
        }

        if (result.outcome === "limit_reached") {
            throw new ConflictError(ERROR_CODES.SHOPPING_LIST_LIMIT_REACHED);
        }

        return result.item;
    }
}
