import { ERROR_CODES } from "constants/errorCodes";
import Menu from "domain/entities/Menu";
import { ValidationError } from "domain/errors/AppError";

import CreateMenu from "application/use-cases/menus/CreateMenu";

import { catchError } from "test/helpers/assertions";

function makeInput(overrides = {}) {
    return {
        menuTitle: "Weekly menu",
        menuContent: "A simple dinner plan",
        language: "pl",
        categoryId: 2,
        personId: 7,
        recipeIds: [3, 5],
        ...overrides,
    };
}

function setup() {
    const menuRepository = { create: jest.fn() };
    const recipeRepository = { findExistingIds: jest.fn() };
    const useCase = new CreateMenu(menuRepository, recipeRepository);

    return { useCase, menuRepository, recipeRepository };
}

describe("CreateMenu", () => {
    it("should create a menu entity with recipe ids and return the repository result", async () => {
        const { useCase, menuRepository, recipeRepository } = setup();
        const input = makeInput();
        const createdMenu = { id: 9, menuTitle: input.menuTitle };

        recipeRepository.findExistingIds.mockResolvedValue(input.recipeIds);
        menuRepository.create.mockResolvedValue(createdMenu);

        const result = await useCase.execute(input);
        const [menu, recipeIds] = menuRepository.create.mock.calls[0] as [
            Menu,
            number[],
        ];

        expect(menu).toBeInstanceOf(Menu);
        expect(menu).toMatchObject({
            menuTitle: input.menuTitle,
            menuContent: input.menuContent,
            categoryId: input.categoryId,
            personId: input.personId,
        });
        expect(recipeIds).toEqual(input.recipeIds);
        expect(menuRepository.create).toHaveBeenCalledWith(
            menu,
            input.recipeIds,
        );
        expect(result).toEqual(createdMenu);
    });

    it("should create a menu from a public recipe owned by another user", async () => {
        const { useCase, menuRepository, recipeRepository } = setup();
        const input = makeInput();

        recipeRepository.findExistingIds.mockResolvedValue(input.recipeIds);
        menuRepository.create.mockResolvedValue({ id: 9 });

        await useCase.execute(input);

        expect(menuRepository.create).toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when a recipe does not exist", async () => {
        const { useCase, menuRepository, recipeRepository } = setup();

        recipeRepository.findExistingIds.mockResolvedValue([3]);

        const error = await catchError(useCase.execute(makeInput()));

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.MENU_RECIPES_NOT_EXIST,
            400,
        );
        expect(menuRepository.create).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when recipe ids are duplicated", async () => {
        const { useCase, menuRepository } = setup();

        const error = await catchError(
            useCase.execute(makeInput({ recipeIds: [3, 3] })),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "recipeIds: Recipe IDs must be unique",
        );
        expect(menuRepository.create).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError and not create when input is invalid", async () => {
        const { useCase, menuRepository } = setup();

        const error = await catchError(
            useCase.execute(makeInput({ recipeIds: [] })),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.MENU_INSUFFICIENT_DATA_CREATE,
            400,
        );
        expect(menuRepository.create).not.toHaveBeenCalled();
    });

    it("should throw a 400 ValidationError when the language is not supported", async () => {
        const { useCase, menuRepository } = setup();

        const error = await catchError(
            useCase.execute(makeInput({ language: "de" })),
        );

        expect(error).toBeAppError(
            ValidationError,
            ERROR_CODES.VALIDATION_ERROR,
            400,
            "language: Language must be one of en, pl, ru, uk",
        );
        expect(menuRepository.create).not.toHaveBeenCalled();
    });
});
