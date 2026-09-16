import { ERROR_CODES } from "constants/errorCodes";
import Menu from "domain/entities/Menu";
import { NotFoundError } from "domain/errors/AppError";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import { assertRecipesExist } from "application/validation/assertRecipesExist";
import { idSchema } from "application/validation/common.schemas";
import { updateMenuSchema } from "application/validation/menu.schemas";
import { validate } from "application/validation/validate";

export default class UpdateMenu {
    constructor(
        private menuRepository: Pick<MenuRepository, "update">,
        private recipeRepository: Pick<RecipeRepository, "findExistingIds">,
    ) {}

    async execute(
        id: string | number | null,
        personId: number,
        input: unknown,
    ): Promise<void> {
        const menuId = validate(idSchema, id);
        const data = validate(updateMenuSchema, input);
        const menu = Menu.forUpdate(menuId, data);

        await assertRecipesExist(this.recipeRepository, data.recipeIds);
        const updated = await this.menuRepository.update(
            menuId,
            personId,
            menu,
            data.recipeIds,
        );

        if (!updated) {
            throw new NotFoundError(ERROR_CODES.MENU_NOT_FOUND);
        }
    }
}
