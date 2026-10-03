import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import CreateRecipePage from "app/[locale]/(private)/add-recipe/page";
import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { LABEL_COOKING_TIME, ROUTE_ALL_RECIPES } from "test/constants";
import { mockNavigate, renderWithRouter } from "test/router";

jest.mock("api/client");

const TYPE_ID = 3;
const TYPE_NAME = "Soup";
const INGREDIENT_ID = 11;
const INGREDIENT_NAME = "Potato";
const TITLE = "Mashed potatoes";
const DESCRIPTION = "Boil and mash";
const CREATE_BUTTON = "Create recipe";
const DEBOUNCE_MS = 300;

const SAMPLE_TYPES = [{ id: TYPE_ID, type_name: TYPE_NAME, description: "" }];
const SAMPLE_INGREDIENTS = [
    {
        id: INGREDIENT_ID,
        slug: "potato",
        name: INGREDIENT_NAME,
        category: "vegetables",
        unit_name: "g",
        allergens: [],
        days_to_expire: 30,
        calories_per_unit: null,
    },
];

describe("CreateRecipePage", () => {
    it("should create the recipe and go to the recipe list on submit", async () => {
        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });

        try {
            mockGetByUrl({
                [API_ROUTES.ingredients.list]: SAMPLE_INGREDIENTS,
                [API_ROUTES.recipeTypes.list]: SAMPLE_TYPES,
            });
            mockedPost.mockResolvedValue({ data: { id: 42 } });

            renderWithRouter(<CreateRecipePage />);

            await screen.findByRole("option", { name: TYPE_NAME });
            await user.type(screen.getByLabelText("Title *"), TITLE);
            await user.type(
                screen.getByLabelText("Description *"),
                DESCRIPTION,
            );
            await user.type(screen.getByLabelText(LABEL_COOKING_TIME), "0");
            await user.type(screen.getByLabelText("Minutes"), "30");
            await user.selectOptions(
                screen.getByLabelText("Recipe type *"),
                String(TYPE_ID),
            );
            await user.type(
                await screen.findByPlaceholderText("Search ingredients…"),
                INGREDIENT_NAME,
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });
            await user.click(
                screen.getByRole("button", {
                    name: new RegExp(INGREDIENT_NAME, "i"),
                }),
            );
            await user.click(
                screen.getByRole("button", { name: CREATE_BUTTON }),
            );
            // flushes the promise chain between the save and the navigation
            await act(async () => {
                await jest.runOnlyPendingTimersAsync();
            });

            expect(mockedPost).toHaveBeenCalledWith(
                API_ROUTES.recipes.create,
                expect.objectContaining({
                    title: TITLE,
                    content: DESCRIPTION,
                    type_id: TYPE_ID,
                    calories_override: null,
                    ingredients: [{ id: INGREDIENT_ID, quantity: 1 }],
                }),
            );
            expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_RECIPES);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should take focus to the first field in error on a failed submit", async () => {
        mockGetByUrl({
            [API_ROUTES.ingredients.list]: SAMPLE_INGREDIENTS,
            [API_ROUTES.recipeTypes.list]: SAMPLE_TYPES,
        });

        renderWithRouter(<CreateRecipePage />);

        await screen.findByRole("option", { name: TYPE_NAME });
        await userEvent.click(
            screen.getByRole("button", { name: CREATE_BUTTON }),
        );

        expect(screen.getByLabelText("Title *")).toHaveFocus();

        await userEvent.type(screen.getByLabelText("Title *"), TITLE);
        await userEvent.click(
            screen.getByRole("button", { name: CREATE_BUTTON }),
        );

        expect(screen.getByLabelText("Recipe type *")).toHaveFocus();
        expect(mockedPost).not.toHaveBeenCalled();
    });
});
