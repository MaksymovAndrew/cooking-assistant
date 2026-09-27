import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { PantryRepository } from "domain/repositories/PantryRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class DeletePurchase {
    constructor(
        private pantryRepository: Pick<PantryRepository, "deletePurchases">,
    ) {}

    async execute(
        userId: string | number,
        purchaseId: string | number,
    ): Promise<void> {
        const validUserId = validate(idSchema, userId);
        const validPurchaseId = validate(idSchema, purchaseId);
        const deleted = await this.pantryRepository.deletePurchases(
            validUserId,
            [validPurchaseId],
        );

        if (deleted === 0) {
            throw new NotFoundError(ERROR_CODES.PURCHASE_NOT_FOUND);
        }
    }
}
