import { ERROR_MESSAGES } from "constants/errorMessages";
import { NotFoundError } from "domain/errors/AppError";
import type { MenuRepository } from "domain/repositories/MenuRepository";

import { idSchema } from "application/validation/common.schemas";
import { validate } from "application/validation/validate";

export default class GetMenuById {
    constructor(
        private menuRepository: Pick<MenuRepository, "findByIdWithRecipes">,
    ) {}

    async execute(
        id: string | number | null,
        personId: number | null,
    ): Promise<unknown> {
        const menuId = validate(idSchema, id);
        const menu = await this.menuRepository.findByIdWithRecipes(
            menuId,
            personId,
        );

        if (!menu) {
            throw new NotFoundError(ERROR_MESSAGES.MENU_NOT_FOUND);
        }

        return menu;
    }
}
