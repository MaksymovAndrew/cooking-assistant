import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";
import { MODAL_TYPE } from "redux/slices/uiSlice";

import { ModalRoot } from "components/modals";

import { RecipeDetailsView } from "app/(public)/recipe/[id]/RecipeDetailsView";
import { mockedDelete, mockGetByUrl } from "test/apiClientMock";
import {
    BTN_DELETE_RECIPE,
    BTN_EDIT_RECIPE,
    ROUTE_ALL_RECIPES,
    TEST_AUTHOR,
    TEST_UNRATED,
} from "test/constants";
import { mockNavigate, renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const TITLE = "Borscht";
const LOG_INTAKE_BUTTON = "Log intake";
const SAMPLE: RecipeDetails = {
    id: 1,
    title: TITLE,
    content: "boil",
    ingredients: [],
    type_id: 2,
    type_name: "Soup",
    cooking_time: 60,
    creation_date: "2024-01-01",
    isOwner: true,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: false,
    containsAvoided: false,
    tags: [],
    calories_per_portion: null,
    calories_override: null,
};

// the recipe itself comes from the server render now, as a prop; the pantry is still the
// viewer's own client-side request
const renderPage = (
    recipe: RecipeDetails = SAMPLE,
    store = makeTestStore(),
) => {
    mockGetByUrl({ [API_ROUTES.userIngredients.list]: [] });

    return renderWithProviders(
        <>
            <RecipeDetailsView recipe={recipe} />
            <ModalRoot />
        </>,
        { store, initialEntries: ["/recipe/1"] },
    );
};

describe("RecipeDetailsView", () => {
    it("should render the recipe title it is given", () => {
        renderPage();

        expect(
            screen.getByRole("heading", { name: TITLE }),
        ).toBeInTheDocument();
    });

    it("should show Edit and Delete buttons when current user is the recipe owner", () => {
        renderPage();

        expect(
            screen.getByRole("link", { name: BTN_EDIT_RECIPE }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        ).toBeInTheDocument();
    });

    it("should open the global delete modal and navigate to /main after delete", async () => {
        mockedDelete.mockResolvedValue({ data: null });

        const { store } = renderPage();

        await userEvent.click(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        );

        expect(selectActiveModal(store.getState())?.type).toBe(
            MODAL_TYPE.deleteRecipe,
        );

        const dialog = await screen.findByRole("dialog");

        await userEvent.click(
            within(dialog).getByRole("button", { name: BTN_DELETE_RECIPE }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.recipes.byId("1"),
            { params: undefined },
        );
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_RECIPES);
    });

    it("should render cooking time in minutes only when under an hour", () => {
        renderPage({ ...SAMPLE, cooking_time: 45 });

        expect(screen.getByText("45 min")).toBeInTheDocument();
    });

    it("should close the delete confirmation modal when cancelled", async () => {
        const { store } = renderPage();

        await userEvent.click(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        );
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(selectActiveModal(store.getState())).toBeNull();
    });

    it("should not show the log-intake button when the recipe has no calorie data", () => {
        renderPage();

        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_BUTTON }),
        ).not.toBeInTheDocument();
    });

    it("should open the log-intake modal with the recipe's calories per portion", async () => {
        const { store } = renderPage({ ...SAMPLE, calories_per_portion: 420 });

        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.logIntake,
            recipeId: 1,
            title: TITLE,
            caloriesPerPortion: 420,
            initialPortions: 1,
        });
    });

    it("should open the log-intake modal pre-filled with the portions already selected on the page", async () => {
        const { store } = renderPage({ ...SAMPLE, calories_per_portion: 420 });

        await userEvent.click(
            screen.getByRole("button", { name: "More portions" }),
        );
        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        expect(selectActiveModal(store.getState())).toMatchObject({
            type: MODAL_TYPE.logIntake,
            initialPortions: 2,
        });
    });
});
