import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type {
    ShoppingListItemRow,
    ShoppingListRepository,
} from "domain/repositories/ShoppingListRepository";

import { idSchema } from "application/validation/common.schemas";
import { updateShoppingListItemSchema } from "application/validation/shoppingList.schemas";
import { validate } from "application/validation/validate";

export default class UpdateShoppingListItem {
    constructor(
        private shoppingListRepository: Pick<
            ShoppingListRepository,
            "updateItem"
        >,
    ) {}

    async execute(
        personId: string | number,
        itemId: string | number,
        input: unknown,
    ): Promise<ShoppingListItemRow> {
        const validPersonId = validate(idSchema, personId);
        const validItemId = validate(idSchema, itemId);
        const changes = validate(updateShoppingListItemSchema, input);

        const item = await this.shoppingListRepository.updateItem(
            validPersonId,
            validItemId,
            changes,
        );

        if (!item) {
            throw new NotFoundError(ERROR_CODES.SHOPPING_LIST_ITEM_NOT_FOUND);
        }

        return item;
    }
}
