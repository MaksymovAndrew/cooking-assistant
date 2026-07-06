import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Ingredient } from "types/ingredient";
import type { UserIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { ModalRoot } from "components/modals";

import IngredientsPage from "pages/person-ingredients/IngredientsPage";
import { mockedDelete, mockedGet, mockedPut } from "test/apiClientMock";
import { BTN_ADD_INGREDIENT } from "test/constants";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const INGREDIENT_NAME = "Potato";
const SEARCH_INGREDIENTS_PLACEHOLDER = "Search ingredients...";
const SAVE_QUANTITIES = "Save quantities";
const USER_INGREDIENTS: UserIngredient[] = [
    {
        ingredient_id: 5,
        ingredient_name: INGREDIENT_NAME,
        unit_name: "g",
        quantity_person_ingradient: 100,
    },
];
const ALL_INGREDIENTS: Ingredient[] = [
    { id: 5, name: INGREDIENT_NAME, unit_name: "g" },
    { id: 6, name: "Tomato", unit_name: "kg" },
];

let pantry: UserIngredient[];

const setup = () => {
    pantry = USER_INGREDIENTS;
    mockedGet.mockImplementation((url: string) => {
        if (url === API_ROUTES.ingredients.list) {
            return Promise.resolve({ data: ALL_INGREDIENTS });
        }

        if (url === API_ROUTES.userIngredients.list) {
            return Promise.resolve({ data: pantry });
        }

        return Promise.reject(new Error(`unexpected GET ${url}`));
    });

    return renderWithProviders(
        <>
            <IngredientsPage />
            <ModalRoot />
        </>,
    );
};

const deleteMessage = `Are you sure you want to delete the ingredient "${INGREDIENT_NAME}"?`;

describe("IngredientsPage", () => {
    it("should render the user's pantry ingredients loaded from the api", async () => {
        setup();

        expect(await screen.findByText(INGREDIENT_NAME)).toBeInTheDocument();
    });

    it("should open the add-ingredient modal and search for a new ingredient", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(
            screen.getByRole("button", { name: BTN_ADD_INGREDIENT }),
        );
        await userEvent.type(
            screen.getByPlaceholderText(SEARCH_INGREDIENTS_PLACEHOLDER),
            "tom",
        );

        expect(
            screen.getByRole("button", { name: /tom/i }),
        ).toBeInTheDocument();
    });

    it("should close the add-ingredient modal after saving", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(
            screen.getByRole("button", { name: BTN_ADD_INGREDIENT }),
        );
        await userEvent.click(
            screen.getByRole("button", { name: "Add to pantry" }),
        );

        expect(
            screen.queryByPlaceholderText(SEARCH_INGREDIENTS_PLACEHOLDER),
        ).not.toBeInTheDocument();
    });

    it("should close the add-ingredient modal without saving on Cancel", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(
            screen.getByRole("button", { name: BTN_ADD_INGREDIENT }),
        );
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(
            screen.queryByPlaceholderText(SEARCH_INGREDIENTS_PLACEHOLDER),
        ).not.toBeInTheDocument();
        expect(mockedPut).not.toHaveBeenCalled();
    });

    it("should show the delete confirmation modal when Delete is clicked", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(screen.getByRole("button", { name: "Delete" }));

        expect(screen.getByText(deleteMessage)).toBeInTheDocument();
    });

    it("should show the quantity input after clicking Edit quantities", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(
            screen.getByRole("button", { name: "Edit quantities" }),
        );

        expect(
            screen.getByRole("button", { name: SAVE_QUANTITIES }),
        ).toBeInTheDocument();
        expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    });

    it("should hide the quantity input after clicking Save quantities", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(
            screen.getByRole("button", { name: "Edit quantities" }),
        );
        await userEvent.click(
            screen.getByRole("button", { name: SAVE_QUANTITIES }),
        );

        expect(
            screen.queryByRole("button", { name: SAVE_QUANTITIES }),
        ).not.toBeInTheDocument();
    });

    it("should close the delete confirmation modal when Cancel is clicked", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(screen.getByRole("button", { name: "Delete" }));
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(screen.queryByText(deleteMessage)).not.toBeInTheDocument();
    });

    it("should remove the ingredient from the list after confirming delete", async () => {
        mockedDelete.mockImplementation(() => {
            pantry = [];

            return Promise.resolve({ data: null });
        });
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(screen.getByRole("button", { name: "Delete" }));
        await userEvent.click(screen.getByRole("button", { name: "Confirm" }));

        // RTK Query refetch after Pantry tag invalidation is async; wait for
        // the empty-state text before asserting the ingredient is gone
        await screen.findByText("You currently have no ingredients.");
        expect(screen.queryByText(INGREDIENT_NAME)).not.toBeInTheDocument();
    });

    it("should filter ingredients by the search box", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.type(
            screen.getByPlaceholderText("Search your pantry..."),
            "zzz",
        );

        expect(screen.queryByText(INGREDIENT_NAME)).not.toBeInTheDocument();
        expect(
            screen.getByText("No ingredients match your search."),
        ).toBeInTheDocument();
    });
});
