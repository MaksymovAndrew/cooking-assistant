import { act, screen } from "@testing-library/react";
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
const DEBOUNCE_MS = 300;

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });
const SAVE_QUANTITY = "Save";
const EDIT_QUANTITIES = "Edit quantities";
const SALMON_NAME = "Salmon fillet";
const USER_INGREDIENTS: UserIngredient[] = [
    {
        ingredient_id: 5,
        ingredient_slug: "potato",
        ingredient_name: INGREDIENT_NAME,
        category: "vegetables",
        unit_name: "g",
        quantity_person_ingradient: 100,
        allergens: [],
    },
];
const ALL_INGREDIENTS: Ingredient[] = [
    {
        id: 5,
        slug: "potato",
        name: INGREDIENT_NAME,
        category: "vegetables",
        unit_name: "g",
        allergens: [],
        days_to_expire: 30,
        calories_per_unit: null,
    },
    {
        id: 6,
        slug: "tomato",
        name: "Tomato",
        category: "vegetables",
        unit_name: "kg",
        allergens: [],
        days_to_expire: 7,
        calories_per_unit: null,
    },
];

let pantry: UserIngredient[];

const setup = (initialPantry: UserIngredient[] = USER_INGREDIENTS) => {
    pantry = initialPantry;
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

        jest.useFakeTimers();
        const user = setupUser();

        try {
            await user.type(
                screen.getByPlaceholderText(SEARCH_INGREDIENTS_PLACEHOLDER),
                "tom",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(
                screen.getByRole("button", { name: /tom/i }),
            ).toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
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

    it("should show a per-card quantity input and Save button after clicking Edit quantities", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(
            screen.getByRole("button", { name: EDIT_QUANTITIES }),
        );

        expect(
            screen.getByRole("button", { name: SAVE_QUANTITY }),
        ).toBeInTheDocument();
        expect(screen.getByRole("spinbutton")).toBeInTheDocument();
    });

    it("should persist the edited quantity and keep the edit session open after clicking the card's Save", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(
            screen.getByRole("button", { name: EDIT_QUANTITIES }),
        );
        await userEvent.clear(screen.getByRole("spinbutton"));
        await userEvent.type(screen.getByRole("spinbutton"), "5");
        await userEvent.click(
            screen.getByRole("button", { name: SAVE_QUANTITY }),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.updateQuantities,
            expect.anything(),
        );
        expect(
            screen.getByRole("button", { name: SAVE_QUANTITY }),
        ).toBeInTheDocument();
    });

    it("should hide the quantity input after clicking Done", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(
            screen.getByRole("button", { name: EDIT_QUANTITIES }),
        );
        await userEvent.click(screen.getByRole("button", { name: "Done" }));

        expect(
            screen.queryByRole("button", { name: SAVE_QUANTITY }),
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

        // RTK Query refetch after Pantry tag invalidation is async; wait for the empty-state text before asserting the ingredient is gone
        await screen.findByText("You currently have no ingredients.");
        expect(screen.queryByText(INGREDIENT_NAME)).not.toBeInTheDocument();
    });

    it("should filter ingredients by the search box", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        jest.useFakeTimers();
        const user = setupUser();

        try {
            await user.type(
                screen.getByPlaceholderText("Search your pantry..."),
                "zzz",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });

            expect(screen.queryByText(INGREDIENT_NAME)).not.toBeInTheDocument();
            expect(
                screen.getByText("No ingredients match your search."),
            ).toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should filter the pantry by category using the category select", async () => {
        setup([
            ...USER_INGREDIENTS,
            {
                ingredient_id: 6,
                ingredient_slug: "salmon",
                ingredient_name: SALMON_NAME,
                category: "fish",
                unit_name: "g",
                quantity_person_ingradient: 200,
                allergens: ["fish"],
            },
        ]);

        await screen.findByText(INGREDIENT_NAME);
        expect(screen.getByText(SALMON_NAME)).toBeInTheDocument();

        await userEvent.selectOptions(
            screen.getByRole("combobox", { name: "Filter by category" }),
            "fish",
        );

        expect(screen.queryByText(INGREDIENT_NAME)).not.toBeInTheDocument();
        expect(screen.getByText(SALMON_NAME)).toBeInTheDocument();
    });
});
