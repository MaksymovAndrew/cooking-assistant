import Menu from "domain/entities/Menu";
import type { MenuCategoryRepository } from "domain/repositories/MenuCategoryRepository";
import type { MenuRepository } from "domain/repositories/MenuRepository";
import type { RecipeRepository } from "domain/repositories/RecipeRepository";

import { assertRecipesExist } from "application/validation/assertRecipesExist";
import { assertMenuCategoryExists } from "application/validation/assertReferenceExists";
import { createMenuSchema } from "application/validation/menu.schemas";
import { validate } from "application/validation/validate";

export default class CreateMenu {
    constructor(
        private menuRepository: Pick<MenuRepository, "create">,
        private recipeRepository: Pick<RecipeRepository, "findExistingIds">,
        private menuCategoryRepository: Pick<MenuCategoryRepository, "exists">,
    ) {}

    async execute(input: unknown): Promise<unknown> {
        const data = validate(createMenuSchema, input);
        const menu = Menu.forCreation(data);

        await assertRecipesExist(this.recipeRepository, data.recipeIds);
        await assertMenuCategoryExists(
            this.menuCategoryRepository,
            data.categoryId,
        );

        return this.menuRepository.create(menu, data.recipeIds);
    }
}
