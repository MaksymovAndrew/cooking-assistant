import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Provider } from "react-redux";
import type * as ReactRouterDom from "react-router-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ModalRoot } from "components/modals";

import RecipeDetailsPage from "pages/recipes/RecipeDetailsPage";
import { mockedDelete, mockedGet } from "test/apiClientMock";
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
        mockedGet.mockResolvedValue({ data: SAMPLE });

        renderPage();

        expect(await screen.findByText(TITLE)).toBeInTheDocument();
    });

    it("should show Edit and Delete buttons when current user is the recipe owner", async () => {
        mockedGet.mockResolvedValue({ data: SAMPLE });

        renderPage();
        await screen.findByText(TITLE);

        expect(
            screen.getByRole("button", { name: BTN_EDIT_RECIPE }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        ).toBeInTheDocument();
    });

    it("should open the global delete modal and navigate to /main after delete", async () => {
        mockedGet.mockResolvedValue({ data: SAMPLE });
        mockedDelete.mockResolvedValue({ data: null });

        const { store } = renderPage();

        await screen.findByText(TITLE);

        await userEvent.click(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        );

        expect(store.getState().ui.modal?.type).toBe(MODAL_TYPE.deleteRecipe);

        await userEvent.click(screen.getByRole("button", { name: "Delete" }));

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

    it("should render cooking time in minutes only when under an hour", async () => {
        mockedGet.mockResolvedValue({ data: { ...SAMPLE, cooking_time: 45 } });

        renderPage();
        await screen.findByText(TITLE);

        expect(screen.getByText("45 minutes")).toBeInTheDocument();
    });

    it("should close the delete confirmation modal when cancelled", async () => {
        mockedGet.mockResolvedValue({ data: SAMPLE });

        const { store } = renderPage();

        await screen.findByText(TITLE);

        await userEvent.click(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        );
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(store.getState().ui.modal).toBeNull();
    });
});
