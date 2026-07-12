import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import type * as ReactRouterDom from "react-router-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ModalRoot } from "components/modals";

import RecipeDetailsPage from "pages/recipes/RecipeDetailsPage";
import { mockedDelete, mockedGet, mockGetByUrl } from "test/apiClientMock";
import {
    BTN_DELETE_RECIPE,
    BTN_EDIT_RECIPE,
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
const OWNER_ID = 3;
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
    person_id: OWNER_ID,
    isOwner: true,
};

const mockRecipe = (recipe: RecipeDetails = SAMPLE) => {
    mockGetByUrl({
        [API_ROUTES.recipes.byId("1")]: recipe,
        [API_ROUTES.userIngredients.list]: [],
    });
};

const renderPage = (store = makeTestStore()) => {
    const view = render(
        <Provider store={store}>
            <MemoryRouter initialEntries={["/recipe/1"]}>
                <Routes>
                    <Route
                        path="/recipe/:id"
                        element={
                            <>
                                <RecipeDetailsPage />
                                <ModalRoot />
                            </>
                        }
                    />
                </Routes>
            </MemoryRouter>
        </Provider>,
    );

    return { store, ...view };
};

describe("RecipeDetailsPage", () => {
    it("should render the recipe title loaded from the api", async () => {
        mockRecipe();

        renderPage();

        expect(
            await screen.findByRole("heading", { name: TITLE }),
        ).toBeInTheDocument();
    });

    it("should show Edit and Delete buttons when current user is the recipe owner", async () => {
        mockRecipe();

        renderPage();
        await screen.findByRole("heading", { name: TITLE });

        expect(
            screen.getByRole("link", { name: BTN_EDIT_RECIPE }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        ).toBeInTheDocument();
    });

    it("should open the global delete modal and navigate to /main after delete", async () => {
        mockRecipe();
        mockedDelete.mockResolvedValue({ data: null });

        const { store } = renderPage();

        await screen.findByRole("heading", { name: TITLE });

        await userEvent.click(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        );

        expect(store.getState().ui.modal?.type).toBe(MODAL_TYPE.deleteRecipe);

        const dialog = screen.getByRole("dialog");

        await userEvent.click(
            within(dialog).getByRole("button", { name: BTN_DELETE_RECIPE }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.recipes.byId("1"),
            { params: undefined },
        );
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_RECIPES);
    });

    it("should show an error message when the recipe fails to load", async () => {
        mockedGet.mockRejectedValue(new Error("boom"));

        renderPage();

        expect(
            await screen.findByText("Error: Error fetching recipe details"),
        ).toBeInTheDocument();
    });

    it("should render a translated Try again button, not a raw i18n key", async () => {
        mockedGet.mockRejectedValue(new Error("boom"));

        renderPage();

        expect(
            await screen.findByRole("button", { name: "Try again" }),
        ).toBeInTheDocument();
    });

    it("should render cooking time in minutes only when under an hour", async () => {
        mockRecipe({ ...SAMPLE, cooking_time: 45 });

        renderPage();
        await screen.findByRole("heading", { name: TITLE });

        expect(screen.getByText("45 min")).toBeInTheDocument();
    });

    it("should close the delete confirmation modal when cancelled", async () => {
        mockRecipe();

        const { store } = renderPage();

        await screen.findByRole("heading", { name: TITLE });

        await userEvent.click(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        );
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(store.getState().ui.modal).toBeNull();
    });
});
