import type { PantryRepository } from "domain/repositories/PantryRepository";

import { idSchema } from "application/validation/common.schemas";
import { discardPurchasesSchema } from "application/validation/pantry.schemas";
import { validate } from "application/validation/validate";

// ids that are not the user's, or already gone, are skipped rather than refused
export default class DiscardPurchases {
    constructor(
        private pantryRepository: Pick<PantryRepository, "deletePurchases">,
    ) {}

    async execute(
        userId: string | number,
        purchaseIds: unknown,
    ): Promise<number> {
        const validUserId = validate(idSchema, userId);
        const validPurchaseIds = validate(discardPurchasesSchema, purchaseIds);

        return this.pantryRepository.deletePurchases(
            validUserId,
            validPurchaseIds,
        );
    }
}
