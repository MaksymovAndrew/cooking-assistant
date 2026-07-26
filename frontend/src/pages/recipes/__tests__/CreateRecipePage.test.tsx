import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type * as ReactRouterDom from "react-router-dom";

import { API_ROUTES } from "api/endpoints";

import CreateRecipePage from "pages/recipes/CreateRecipePage";
import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { LABEL_COOKING_TIME, ROUTE_ALL_RECIPES } from "test/constants";
import { mockNavigate, renderWithRouter } from "test/router";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const TYPE_ID = 3;
const TYPE_NAME = "Soup";
const INGREDIENT_ID = 11;
const INGREDIENT_NAME = "Potato";
const TITLE = "Mashed potatoes";
const DESCRIPTION = "Boil and mash";

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
    it("should create the recipe and navigate home on submit", async () => {
        mockGetByUrl({
            [API_ROUTES.ingredients.list]: SAMPLE_INGREDIENTS,
            [API_ROUTES.recipeTypes.list]: SAMPLE_TYPES,
        });
        mockedPost.mockResolvedValue({ data: null });

        renderWithRouter(<CreateRecipePage />);

        await screen.findByPlaceholderText("Search ingredients...");
        await screen.findByRole("option", { name: TYPE_NAME });

        await userEvent.type(screen.getByLabelText("Title *"), TITLE);
        await userEvent.type(
            screen.getByLabelText("Description *"),
            DESCRIPTION,
        );
        await userEvent.type(screen.getByLabelText(LABEL_COOKING_TIME), "0");
        await userEvent.type(screen.getByLabelText("Minutes"), "30");
        await userEvent.selectOptions(
            screen.getByLabelText("Recipe type *"),
            String(TYPE_ID),
        );
        await userEvent.type(
            screen.getByPlaceholderText("Search ingredients..."),
            INGREDIENT_NAME,
        );
        await userEvent.click(
            screen.getByRole("button", {
                name: new RegExp(INGREDIENT_NAME, "i"),
            }),
        );
        await userEvent.click(
            screen.getByRole("button", { name: "Create recipe" }),
        );

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.recipes.create,
            expect.objectContaining({
                title: TITLE,
                content: DESCRIPTION,
                type_id: TYPE_ID,
                servings: "1",
                ingredients: [{ id: INGREDIENT_ID, quantity: 1 }],
            }),
        );
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_RECIPES);
    });
});
