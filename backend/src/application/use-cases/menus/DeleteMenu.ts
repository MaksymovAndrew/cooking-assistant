import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { MenuRepository } from "domain/repositories/MenuRepository";

import type PhotoCleanup from "application/media/PhotoCleanup";
import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class DeleteMenu {
    constructor(
        private menuRepository: Pick<MenuRepository, "deleteById">,
        private photoCleanup: PhotoCleanup,
    ) {}

    async execute(id: string | number | null, personId: number): Promise<void> {
        const menuId = validate(idSchema, id);
        const photoKey = await this.photoCleanup.keyOf(
            personId,
            "menu",
            menuId,
        );
        const deleted = await this.menuRepository.deleteById(menuId, personId);

        if (!deleted) {
            throw new NotFoundError(ERROR_CODES.MENU_NOT_FOUND);
        }

        await this.photoCleanup.removeAll([photoKey]);
    }
}
