import { ERROR_CODES } from "constants/errorCodes";
import Menu from "domain/entities/Menu";
import { ValidationError } from "domain/errors/AppError";

import { catchSyncError } from "test/helpers/assertions";

function makeInput(overrides: { recipeIds?: number[] } = {}) {
    return {
        menuTitle: "Weekly menu",
        menuContent: "A simple dinner plan",
        language: "uk" as const,
        categoryId: 2,
        personId: 7,
        recipeIds: [3, 5],
        ...overrides,
    };
}

describe("Menu", () => {
    it("should throw a 400 ValidationError when creation recipeIds are empty", () => {
        const error = catchSyncError(() => {
            Menu.forCreation(makeInput({ recipeIds: [] }));
        });

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.MENU_INSUFFICIENT_DATA_CREATE,
            400,
        );
    });

    it("should create a menu with creation fields", () => {
        const input = makeInput();

        const menu = Menu.forCreation(input);

        expect(menu).toBeInstanceOf(Menu);
        expect(Object.keys(menu)).toEqual([
            "menuTitle",
            "menuContent",
            "language",
            "categoryId",
            "personId",
        ]);
        expect(menu).toMatchObject({
            menuTitle: input.menuTitle,
            menuContent: input.menuContent,
            language: "uk",
            categoryId: input.categoryId,
            personId: input.personId,
        });
    });

    it("should throw a 400 ValidationError when update recipeIds are empty", () => {
        const error = catchSyncError(() => {
            Menu.forUpdate(makeInput({ recipeIds: [] }));
        });

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.MENU_INSUFFICIENT_DATA_UPDATE,
            400,
        );
    });

    it("should create an update menu without personId", () => {
        const input = makeInput();

        const menu = Menu.forUpdate(input);

        expect(menu).toBeInstanceOf(Menu);
        expect(Object.keys(menu)).toEqual([
            "menuTitle",
            "menuContent",
            "language",
            "categoryId",
        ]);
        expect(menu).toMatchObject({
            menuTitle: input.menuTitle,
            menuContent: input.menuContent,
            language: "uk",
            categoryId: input.categoryId,
        });
        expect(menu).not.toHaveProperty("personId");
    });
});
