import { ERROR_CODES, type ErrorCode } from "constants/errorCodes";
import type { Locale } from "constants/locales";
import { ValidationError } from "domain/errors/AppError";

export interface MenuInput {
    menuTitle: string;
    menuContent?: string;
    language: Locale;
    categoryId: number;
    personId: number;
    recipeIds: number[];
}

export type MenuUpdateInput = Omit<MenuInput, "personId">;

// the one rule the request schema leaves to the domain
function assertHasRecipes(recipeIds: number[], code: ErrorCode): void {
    if (recipeIds.length === 0) {
        throw new ValidationError(code);
    }
}

export class Menu {
    declare menuTitle: string;
    declare menuContent?: string;
    declare language: Locale;
    declare categoryId: number;
    declare personId?: number;

    static forCreation({
        menuTitle,
        menuContent,
        language,
        categoryId,
        personId,
        recipeIds,
    }: MenuInput): Menu {
        assertHasRecipes(recipeIds, ERROR_CODES.MENU_INSUFFICIENT_DATA_CREATE);

        return new Menu({
            menuTitle,
            menuContent,
            language,
            categoryId,
            personId,
        });
    }

    static forUpdate({
        menuTitle,
        menuContent,
        language,
        categoryId,
        recipeIds,
    }: MenuUpdateInput): Menu {
        assertHasRecipes(recipeIds, ERROR_CODES.MENU_INSUFFICIENT_DATA_UPDATE);

        return new Menu({ menuTitle, menuContent, language, categoryId });
    }

    private constructor(data: Menu) {
        Object.assign(this, data);
    }
}

export default Menu;
