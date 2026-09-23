import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuDetails } from "types/menu";
import type { RecipeWithIngredientNames } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import ChangeMenuPage from "app/(private)/change-menu/[id]/page";
import { mockedPut, mockGetByUrl } from "test/apiClientMock";
import {
    ERROR_RECIPES_REQUIRED,
    ROUTE_ALL_MENUS,
    TEST_AUTHOR,
    TEST_UNRATED,
} from "test/constants";
import { setTestParams } from "test/nextNavigationMock";
import { mockNavigate, renderWithProviders } from "test/router";

jest.mock("api/client");

const TITLE = "Weekday menu";
const UPDATE_MENU = "Save changes";
const CATEGORY_ID = 2;
const RECIPE: RecipeWithIngredientNames = {
    id: 10,
    title: "Borscht",
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    ingredients: [],
};
const MENU_RECIPE = {
    id: 10,
    recipe_id: 10,
    title: "Borscht",
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    calories_per_portion: null,
    photo_key: null,
    ratingAverage: null,
    ratingCount: 0,
};
const CATEGORIES = [{ menu_category_id: CATEGORY_ID, category_name: "Lunch" }];

const SAMPLE: MenuDetails = {
    menu: {
        id: 1,
        title: TITLE,
        categoryname: "Lunch",
        menucontent: "quick",
        category_id: CATEGORY_ID,
        isOwner: true,
        photo_key: null,
        ...TEST_UNRATED,
        author: TEST_AUTHOR,
        isFavourite: false,
    },
    recipes: [],
    allergens: [],
};

const SAMPLE_WITH_RECIPE: MenuDetails = {
    ...SAMPLE,
    recipes: [MENU_RECIPE],
};

const setup = (sample: MenuDetails = SAMPLE) => {
    mockGetByUrl({
        [API_ROUTES.menu.byId("1")]: sample,
        [API_ROUTES.menuCategories.list]: CATEGORIES,
        [API_ROUTES.recipes.list]: [RECIPE],
    });

    setTestParams({ id: "1" });
    renderWithProviders(<ChangeMenuPage />, {
        initialEntries: ["/change-menu/1"],
    });
};

describe("ChangeMenuPage", () => {
    it("should load the menu into the edit form", async () => {
        setup();

        expect(await screen.findByDisplayValue(TITLE)).toBeInTheDocument();
    });

    it("should update the menu with the changed values on valid submit", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup(SAMPLE_WITH_RECIPE);

        await screen.findByDisplayValue(TITLE);

        await userEvent.click(
            screen.getByRole("button", { name: UPDATE_MENU }),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.menu.byId("1"),
            expect.objectContaining({
                menuTitle: TITLE,
                categoryId: CATEGORY_ID,
                recipeIds: [MENU_RECIPE.id],
            }),
        );
    });

    it("should navigate to /menu after successful update", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup(SAMPLE_WITH_RECIPE);

        await screen.findByDisplayValue(TITLE);

        await userEvent.click(
            screen.getByRole("button", { name: UPDATE_MENU }),
        );

        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_MENUS);
    });

    it("should display a validation error when no recipes are selected", async () => {
        setup();

        await screen.findByDisplayValue(TITLE);

        await userEvent.click(
            screen.getByRole("button", { name: UPDATE_MENU }),
        );

        expect(screen.getByText(ERROR_RECIPES_REQUIRED)).toBeInTheDocument();
    });
});
