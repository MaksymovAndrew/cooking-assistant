import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import CreateMenuPage from "app/[locale]/(private)/add-menu/page";
import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { ROUTE_ALL_MENUS } from "test/constants";
import { mockNavigate, renderWithRouter } from "test/router";

jest.mock("api/client");

const CATEGORY_ID = 2;
const CATEGORY_NAME = "Lunch";
const RECIPE_ID = 5;
const RECIPE_TITLE = "Borscht";
const MENU_TITLE = "Weekday menu";
const MENU_DESC = "Quick lunches";
const CREATE_BUTTON = "Create menu";
const SEARCH_PLACEHOLDER = "Search recipes…";
const DEBOUNCE_MS = 300;

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
    },
];

describe("CreateMenuPage", () => {
    it("should create the menu and navigate to the menu list on submit", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });

        try {
            mockGetByUrl({
                [API_ROUTES.menuCategories.list]: SAMPLE_CATEGORIES,
                [API_ROUTES.recipes.byFilters]: {
                    items: SAMPLE_RECIPES,
                    total: 1,
                },
            });
            mockedPost.mockResolvedValue({
                data: { message: "Menu created", menuId: 42 },
            });

            renderWithRouter(<CreateMenuPage />);

            await screen.findByRole("option", { name: CATEGORY_NAME });
            await user.type(screen.getByLabelText("Menu title *"), MENU_TITLE);
            await user.type(
                screen.getByLabelText("Menu description *"),
                MENU_DESC,
            );
            await user.selectOptions(
                screen.getByLabelText("Menu category *"),
                String(CATEGORY_ID),
            );
            await user.type(
                await screen.findByPlaceholderText(SEARCH_PLACEHOLDER),
                RECIPE_TITLE,
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });
            await user.click(
                await screen.findByRole("button", {
                    name: new RegExp(RECIPE_TITLE, "i"),
                }),
            );
            await user.click(
                screen.getByRole("button", { name: CREATE_BUTTON }),
            );
            // flushes the promise chain between the save and the navigation
            await act(async () => {
                await jest.runOnlyPendingTimersAsync();
            });

            expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.menu.create, {
                menuTitle: MENU_TITLE,
                menuContent: MENU_DESC,
                language: "en",
                categoryId: CATEGORY_ID,
                recipeIds: [RECIPE_ID],
            });
            expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_MENUS);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should take focus to the first field in error on a failed submit", async () => {
        mockGetByUrl({
            [API_ROUTES.menuCategories.list]: SAMPLE_CATEGORIES,
            [API_ROUTES.recipes.byFilters]: { items: SAMPLE_RECIPES, total: 1 },
        });

        renderWithRouter(<CreateMenuPage />);

        await screen.findByPlaceholderText(SEARCH_PLACEHOLDER);
        await userEvent.type(screen.getByLabelText("Menu title *"), MENU_TITLE);
        await userEvent.click(
            screen.getByRole("button", { name: CREATE_BUTTON }),
        );

        expect(screen.getByLabelText("Menu category *")).toHaveFocus();
        expect(mockedPost).not.toHaveBeenCalled();
    });
});
