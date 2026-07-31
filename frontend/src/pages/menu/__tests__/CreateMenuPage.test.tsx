import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";

import { API_ROUTES } from "api/endpoints";

import CreateMenuPage from "pages/menu/CreateMenuPage";
import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { ROUTE_ALL_MENUS } from "test/constants";
import { mockNavigate, renderWithRouter } from "test/router";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const CATEGORY_ID = 2;
const CATEGORY_NAME = "Lunch";
const RECIPE_ID = 5;
const RECIPE_TITLE = "Borscht";
const MENU_TITLE = "Weekday menu";
const MENU_DESC = "Quick lunches";

const SAMPLE_CATEGORIES = [
    { menu_category_id: CATEGORY_ID, category_name: CATEGORY_NAME },
];
const SAMPLE_RECIPES = [
    {
        id: RECIPE_ID,
        title: RECIPE_TITLE,
        type_name: "Soup",
        creation_date: "2024-01-01",
        cooking_time: 60,
        ingredients: [],
    },
];

describe("CreateMenuPage", () => {
    it("should create the menu and navigate to the menu list on submit", async () => {
        mockGetByUrl({
            [API_ROUTES.menuCategories.list]: SAMPLE_CATEGORIES,
            [API_ROUTES.recipes.list]: SAMPLE_RECIPES,
        });
        mockedPost.mockResolvedValue({ data: null });

        renderWithRouter(<CreateMenuPage />);

        await screen.findByPlaceholderText("Search recipes...");

        await userEvent.type(screen.getByLabelText("Menu title *"), MENU_TITLE);
        await userEvent.type(
            screen.getByLabelText("Menu description *"),
            MENU_DESC,
        );
        await userEvent.selectOptions(
            screen.getByLabelText("Menu category *"),
            String(CATEGORY_ID),
        );

        const DEBOUNCE_MS = 300;

        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });

        try {
            await user.type(
                screen.getByPlaceholderText("Search recipes..."),
                RECIPE_TITLE,
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });
            await user.click(
                screen.getByRole("button", {
                    name: new RegExp(RECIPE_TITLE, "i"),
                }),
            );
        } finally {
            jest.useRealTimers();
        }

        await userEvent.click(
            screen.getByRole("button", { name: "Create menu" }),
        );

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.menu.create, {
            menuTitle: MENU_TITLE,
            menuContent: MENU_DESC,
            categoryId: CATEGORY_ID,
            recipeIds: [RECIPE_ID],
        });
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_MENUS);
    });
});
