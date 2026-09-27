import { ERROR_CODES } from "constants/errorCodes";
import Menu from "domain/entities/Menu";
import { NotFoundError, ValidationError } from "domain/errors/AppError";

import UpdateMenu from "application/use-cases/menus/UpdateMenu";

import { catchError } from "test/helpers/assertions";

function makeInput() {
    return {
        menuTitle: "Weekly menu",
        menuContent: "A simple dinner plan",
        language: "pl",
        categoryId: 2,
        recipeIds: [3, 5],
    };
}

function setup() {
    const menuRepository = { update: jest.fn() };
    const recipeRepository = { findExistingIds: jest.fn() };
    const useCase = new UpdateMenu(menuRepository, recipeRepository);

    return { useCase, menuRepository, recipeRepository };
}

describe("UpdateMenu", () => {
    it("should update a menu entity with recipe ids", async () => {
        const { useCase, menuRepository, recipeRepository } = setup();
        const input = makeInput();

        recipeRepository.findExistingIds.mockResolvedValue(input.recipeIds);
        menuRepository.update.mockResolvedValue(true);

        await useCase.execute(9, 7, input);
        const [id, personId, menu, recipeIds] = menuRepository.update.mock
            .calls[0] as [number, number, Menu, number[]];

        expect(id).toBe(9);
        expect(personId).toBe(7);
        expect(menu).toBeInstanceOf(Menu);
        expect(menu).toMatchObject({
            menuTitle: input.menuTitle,
            menuContent: input.menuContent,
            categoryId: input.categoryId,
        });
        expect(recipeIds).toEqual(input.recipeIds);
        expect(menuRepository.update).toHaveBeenCalledWith(
            9,
            7,
            menu,
            input.recipeIds,
        );
    });

    it("should throw a 404 NotFoundError when the menu does not belong to the user", async () => {
        const { useCase, menuRepository, recipeRepository } = setup();

        recipeRepository.findExistingIds.mockResolvedValue(
            makeInput().recipeIds,
        );
        menuRepository.update.mockResolvedValue(false);

        const error = await catchError(useCase.execute(9, 7, makeInput()));

        expect(error).toBeAppError(
            NotFoundError,
            ERROR_CODES.MENU_NOT_FOUND,
            404,
        );
    });

    it("should throw a 400 ValidationError when a recipe does not exist", async () => {
        const { useCase, menuRepository, recipeRepository } = setup();

        recipeRepository.findExistingIds.mockResolvedValue([3]);

        const error = await catchError(useCase.execute(9, 7, makeInput()));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.MENU_RECIPES_NOT_EXIST,
            400,
        );
        expect(menuRepository.update).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when recipe ids are duplicated", async () => {
        const { useCase, menuRepository } = setup();

        const error = await catchError(
            useCase.execute(9, 7, { ...makeInput(), recipeIds: [3, 3] }),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "recipeIds: Recipe IDs must be unique",
        );
        expect(menuRepository.update).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError and not update when input is invalid", async () => {
        const { useCase, menuRepository } = setup();

        const error = await catchError(useCase.execute(null, 7, makeInput()));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "ID is required",
        );
        expect(menuRepository.update).not.toHaveBeenCalled();
    });
});
