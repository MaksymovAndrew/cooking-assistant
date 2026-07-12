import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import type * as ReactRouterDom from "react-router-dom";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import ChangeRecipePage from "pages/recipes/ChangeRecipePage";
import { mockedPut, mockGetByUrl } from "test/apiClientMock";
import {
    ERROR_COOKING_TIME_FORMAT,
    LABEL_COOKING_TIME,
    MOCK_ERROR_SERVER,
    ROUTE_ALL_RECIPES,
} from "test/constants";
import { mockNavigate } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("react-router-dom", () => ({
    ...jest.requireActual<typeof ReactRouterDom>("react-router-dom"),
    useNavigate: () => mockNavigate,
}));
jest.mock("api/client");

const TITLE = "Borscht";
const UPDATE_RECIPE = "Save changes";
const SAMPLE: RecipeDetails = {
    id: 1,
    title: TITLE,
    content: "boil",
    ingredients: [],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    servings: "4",
    person_id: 3,
    isOwner: true,
};

const setup = () => {
    mockGetByUrl({
        [API_ROUTES.recipes.byId("1")]: SAMPLE,
        [API_ROUTES.ingredients.list]: [],
        [API_ROUTES.recipeTypes.list]: [],
    });
    const store = makeTestStore();

    // data router (not <MemoryRouter>): the form inside uses useBlocker
    const router = createMemoryRouter(
        [{ path: "/change-recipe/:id", element: <ChangeRecipePage /> }],
        { initialEntries: ["/change-recipe/1"] },
    );

    render(
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>,
    );

    return { store };
};

const submit = () =>
    userEvent.click(screen.getByRole("button", { name: UPDATE_RECIPE }));

describe("ChangeRecipePage", () => {
    it("should load the recipe into the edit form", async () => {
        setup();

        expect(await screen.findByDisplayValue(TITLE)).toBeInTheDocument();
    });

    it("should show a cooking-time error when submitting with invalid time", async () => {
        setup();

        await screen.findByDisplayValue(TITLE);

        const cookingTimeInput = screen.getByLabelText(LABEL_COOKING_TIME);

        await userEvent.clear(cookingTimeInput);
        await userEvent.type(cookingTimeInput, "invalid");
        await submit();

        expect(screen.getByText(ERROR_COOKING_TIME_FORMAT)).toBeInTheDocument();
    });

    it("should update the recipe with the changed values on valid submit", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup();

        await screen.findByDisplayValue(TITLE);
        await submit();

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.byId("1"),
            expect.objectContaining({ title: TITLE, cooking_time: 60 }),
        );
    });

    it("should navigate home after successful update", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup();

        await screen.findByDisplayValue(TITLE);
        await submit();

        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_RECIPES);
    });

    it("should notify with an error when the update fails", async () => {
        mockedPut.mockRejectedValue({
            isAxiosError: true,
            response: { status: 500, data: { error: MOCK_ERROR_SERVER } },
            message: "Request failed",
        });
        const { store } = setup();

        await screen.findByDisplayValue(TITLE);
        await submit();

        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "error",
                message: MOCK_ERROR_SERVER,
            }),
        ]);
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
