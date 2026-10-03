import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { ModalRoot } from "components/modals";

import { RecipeDetailsView } from "app/[locale]/(public)/recipe/[id]/RecipeDetailsView";
import { mockedDelete, mockGetByUrl } from "test/apiClientMock";
import {
    BTN_DELETE_RECIPE,
    BTN_EDIT_RECIPE,
    ROUTE_ALL_RECIPES,
    TEST_AUTHOR,
    TEST_UNRATED,
} from "test/constants";
import { mockNavigate, renderWithProviders } from "test/router";

jest.mock("api/client");

const TITLE = "Borscht";
const LOG_INTAKE_BUTTON = "Log intake";
const DELETE_DIALOG = "Delete recipe?";
const SAMPLE: RecipeDetails = {
    id: 1,
    title: TITLE,
    language: "en",
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

const renderPage = (recipe: RecipeDetails = SAMPLE) => {
    mockGetByUrl({ [API_ROUTES.userIngredients.list]: [] });

    return renderWithProviders(
        <>
            <RecipeDetailsView recipe={recipe} />
            <ModalRoot />
        </>,
        { initialEntries: ["/recipe/1"] },
    );
};

const openDeleteDialog = async () => {
    await userEvent.click(
        screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
    );

    return screen.findByRole("dialog", { name: DELETE_DIALOG });
};

describe("RecipeDetailsView", () => {
    it("should show Edit and Delete buttons when current user is the recipe owner", () => {
        renderPage();

        expect(
            screen.getByRole("link", { name: BTN_EDIT_RECIPE }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: BTN_DELETE_RECIPE }),
        ).toBeInTheDocument();
    });

    it("should delete the recipe it names once confirmed and go back to the recipe list", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        renderPage();

        const dialog = await openDeleteDialog();

        expect(
            within(dialog).getByText(/delete "Borscht"/),
        ).toBeInTheDocument();

        await userEvent.click(
            within(dialog).getByRole("button", { name: BTN_DELETE_RECIPE }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.recipes.byId("1"),
            { params: undefined },
        );
        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_RECIPES);
    });

    it("should close the delete confirmation modal when cancelled", async () => {
        renderPage();

        const dialog = await openDeleteDialog();

        await userEvent.click(
            within(dialog).getByRole("button", { name: "Cancel" }),
        );

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        expect(mockedDelete).not.toHaveBeenCalled();
    });

    it("should not show the log-intake button when the recipe has no calorie data", () => {
        renderPage();

        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_BUTTON }),
        ).not.toBeInTheDocument();
    });

    it("should open the log-intake modal with the recipe's calories per portion", async () => {
        renderPage({ ...SAMPLE, calories_per_portion: 420 });

        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        const dialog = await screen.findByRole("dialog", {
            name: LOG_INTAKE_BUTTON,
        });

        expect(within(dialog).getByText(TITLE)).toBeInTheDocument();
        expect(within(dialog).getByText("420 kcal total")).toBeInTheDocument();
    });

    it("should open the log-intake modal pre-filled with the portions already selected on the page", async () => {
        renderPage({ ...SAMPLE, calories_per_portion: 420 });

        await userEvent.click(
            screen.getByRole("button", { name: "More portions" }),
        );
        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        const dialog = await screen.findByRole("dialog", {
            name: LOG_INTAKE_BUTTON,
        });

        expect(within(dialog).getByText("840 kcal total")).toBeInTheDocument();
    });
});
