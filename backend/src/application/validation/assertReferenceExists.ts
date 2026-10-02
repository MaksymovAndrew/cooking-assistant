import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";
import type { MenuCategoryRepository } from "domain/repositories/MenuCategoryRepository";
import type { RecipeTypeRepository } from "domain/repositories/RecipeTypeRepository";

// zod checks only the shape, so a well-formed id nobody has would otherwise fail the foreign key as a 500
export async function assertRecipeTypeExists(
    recipeTypeRepository: Pick<RecipeTypeRepository, "exists">,
    typeId: number | undefined,
): Promise<void> {
    if (typeof typeId === "undefined") return;

    if (!(await recipeTypeRepository.exists(typeId))) {
        throw new ValidationError(ERROR_CODES.RECIPE_TYPE_NOT_EXIST);
    }
}

export async function assertMenuCategoryExists(
    menuCategoryRepository: Pick<MenuCategoryRepository, "exists">,
    categoryId: number,
): Promise<void> {
    if (!(await menuCategoryRepository.exists(categoryId))) {
        throw new ValidationError(ERROR_CODES.MENU_CATEGORY_NOT_EXIST);
    }
}
