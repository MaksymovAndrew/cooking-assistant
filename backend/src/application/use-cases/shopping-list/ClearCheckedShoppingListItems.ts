import type { ShoppingListRepository } from "domain/repositories/ShoppingListRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class ClearCheckedShoppingListItems {
    constructor(
        private shoppingListRepository: Pick<
            ShoppingListRepository,
            "deleteChecked"
        >,
    ) {}

    async execute(personId: string | number): Promise<void> {
        const validPersonId = validate(idSchema, personId);

        await this.shoppingListRepository.deleteChecked(validPersonId);
    }
}
