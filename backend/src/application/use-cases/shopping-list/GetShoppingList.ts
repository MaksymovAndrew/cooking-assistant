import type {
    ShoppingListItemRow,
    ShoppingListRepository,
} from "domain/repositories/ShoppingListRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class GetShoppingList {
    constructor(
        private shoppingListRepository: Pick<
            ShoppingListRepository,
            "findByPerson"
        >,
    ) {}

    async execute(personId: string | number): Promise<ShoppingListItemRow[]> {
        const validPersonId = validate(idSchema, personId);

        return this.shoppingListRepository.findByPerson(validPersonId);
    }
}
