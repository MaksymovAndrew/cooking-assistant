import { ERROR_CODES } from "constants/errorCodes";
import { ValidationError } from "domain/errors/AppError";

export interface MenuInput {
    menuTitle?: string;
    menuContent?: string;
    categoryId?: number | null;
    personId?: number;
    recipeIds?: number[];
}

export type MenuUpdateInput = Omit<MenuInput, "personId">;

export class Menu {
    declare menuTitle?: string;
    declare menuContent?: string;
    declare categoryId?: number | null;
    declare personId?: number;

    static forCreation({
        menuTitle,
        menuContent,
        categoryId,
        personId,
        recipeIds,
    }: MenuInput): Menu {
        const hasInsufficientData =
            !menuTitle || !categoryId || !recipeIds || recipeIds.length === 0;

        if (hasInsufficientData) {
            throw new ValidationError(
                ERROR_CODES.MENU_INSUFFICIENT_DATA_CREATE,
            );
        }

        return new Menu({ menuTitle, menuContent, categoryId, personId });
    }

    static forUpdate(
        id: string | number | null | undefined,
        { menuTitle, menuContent, categoryId, recipeIds }: MenuUpdateInput,
    ): Menu {
        const hasInsufficientData =
            !id ||
            !menuTitle ||
            !categoryId ||
            !recipeIds ||
            recipeIds.length === 0;

        if (hasInsufficientData) {
            throw new ValidationError(
                ERROR_CODES.MENU_INSUFFICIENT_DATA_UPDATE,
            );
        }

        return new Menu({ menuTitle, menuContent, categoryId });
    }

    private constructor(data: Partial<Menu>) {
        Object.assign(this, data);
    }
}

export default Menu;
