import { ERROR_CODES } from "constants/errorCodes";
import Menu from "domain/entities/Menu";
import { NotFoundError } from "domain/errors/AppError";
import type { MenuCategoryRepository } from "domain/repositories/MenuCategoryRepository";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import { assertRecipesExist } from "application/validation/assertRecipesExist";
import { assertMenuCategoryExists } from "application/validation/assertReferenceExists";
import { idSchema } from "application/validation/common.schemas";
import { updateMenuSchema } from "application/validation/menu.schemas";
import { validate } from "application/validation/validate";

export default class UpdateMenu {
    constructor(
        private menuRepository: Pick<MenuRepository, "update">,
        private recipeRepository: Pick<RecipeRepository, "findExistingIds">,
        private menuCategoryRepository: Pick<MenuCategoryRepository, "exists">,
    ) {}

    async execute(
        id: string | number | null,
        personId: number,
        input: unknown,
    ): Promise<void> {
        const menuId = validate(idSchema, id);
        const data = validate(updateMenuSchema, input);
        const menu = Menu.forUpdate(data);

        await assertRecipesExist(this.recipeRepository, data.recipeIds);
        await assertMenuCategoryExists(
            this.menuCategoryRepository,
            data.categoryId,
        );
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
