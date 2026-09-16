import { ERROR_CODES } from "constants/errorCodes";
import { NotFoundError } from "domain/errors/AppError";
import type { MenuRepository } from "domain/repositories/MenuRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class DeleteMenu {
    constructor(private menuRepository: Pick<MenuRepository, "deleteById">) {}

    async execute(id: string | number | null, personId: number): Promise<void> {
        const menuId = validate(idSchema, id);
        const deleted = await this.menuRepository.deleteById(menuId, personId);

        if (!deleted) {
            throw new NotFoundError(ERROR_CODES.MENU_NOT_FOUND);
        }
    }
}
