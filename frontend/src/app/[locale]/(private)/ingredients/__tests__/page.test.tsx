import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Ingredient } from "types/ingredient";
import type { UserIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { ModalRoot } from "components/modals";

import IngredientsPage from "app/[locale]/(private)/ingredients/page";
import { mockedDelete, mockedGet, mockedPut } from "test/apiClientMock";
import { BTN_ADD_INGREDIENT } from "test/constants";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const INGREDIENT_NAME = "Potato";
const SEARCH_INGREDIENTS_PLACEHOLDER = "Search ingredients…";
const DEBOUNCE_MS = 300;

const setupUser = () =>
    userEvent.setup({
        advanceTimers: (ms) => {
            jest.advanceTimersByTime(ms);
        },
    });
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
        lots: [],
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
let pantryFailures: number;

const setup = (initialPantry: UserIngredient[] = USER_INGREDIENTS) => {
    pantry = initialPantry;
    mockedGet.mockImplementation((url: string) => {
        if (url === API_ROUTES.ingredients.list) {
            return Promise.resolve({ data: ALL_INGREDIENTS });
        }

        if (url === API_ROUTES.userIngredients.list && pantryFailures > 0) {
            pantryFailures -= 1;

            return Promise.reject(new Error("offline"));
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

beforeEach(() => {
    pantryFailures = 0;
});

const deleteMessage = `Are you sure you want to delete the ingredient "${INGREDIENT_NAME}"?`;

describe("IngredientsPage", () => {
    it("should show a loading state instead of an empty pantry until it arrives", async () => {
        setup();

        expect(screen.getByRole("status", { name: "Loading…" })).toBeVisible();
        expect(
            screen.queryByText("You currently have no ingredients."),
        ).not.toBeInTheDocument();
        expect(await screen.findByText(INGREDIENT_NAME)).toBeInTheDocument();
    });

    it("should show an error with a retry when the pantry cannot be loaded", async () => {
        pantryFailures = 1;
        setup();

        await userEvent.click(
            await screen.findByRole("button", { name: "Try again" }),
        );

        expect(await screen.findByText(INGREDIENT_NAME)).toBeInTheDocument();
    });

    it("should step through quantities and save the new ingredient with its chosen amount", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            mockedPut.mockResolvedValue({ data: null });
            setup();

            await screen.findByText(INGREDIENT_NAME);
            await user.click(
                screen.getByRole("button", { name: BTN_ADD_INGREDIENT }),
            );
            await user.type(
                await screen.findByPlaceholderText(
                    SEARCH_INGREDIENTS_PLACEHOLDER,
                ),
                "tom",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });
            await user.click(screen.getByRole("button", { name: /tom/i }));
            await user.click(screen.getByRole("button", { name: "Continue" }));

            const quantityInput = screen.getByRole("spinbutton");

            await user.clear(quantityInput);
            await user.type(quantityInput, "3");
            await user.click(
                screen.getByRole("button", { name: "Add to pantry" }),
            );

            expect(mockedPut).toHaveBeenCalledWith(
                API_ROUTES.userIngredients.list,
                {
                    ingredients: [
                        {
                            id: 6,
                            ingredient_name: "Tomato",
                            quantity_person_ingradient: 3,
                        },
                    ],
                },
            );
            expect(
                screen.queryByPlaceholderText(SEARCH_INGREDIENTS_PLACEHOLDER),
            ).not.toBeInTheDocument();
        } finally {
            jest.useRealTimers();
        }
    });

    it("should close the add-ingredient modal without saving on Cancel", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(
            screen.getByRole("button", { name: BTN_ADD_INGREDIENT }),
        );
        await screen.findByPlaceholderText(SEARCH_INGREDIENTS_PLACEHOLDER);
        await userEvent.click(screen.getByRole("button", { name: "Cancel" }));

        expect(
            screen.queryByPlaceholderText(SEARCH_INGREDIENTS_PLACEHOLDER),
        ).not.toBeInTheDocument();
        expect(mockedPut).not.toHaveBeenCalled();
    });

    it("should restock an already-owned ingredient by adding to its existing quantity", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(screen.getByRole("button", { name: "Buy more" }));

        const quantityInput = await screen.findByRole("spinbutton");

        await userEvent.clear(quantityInput);
        await userEvent.type(quantityInput, "4");
        await userEvent.click(
            screen.getByRole("button", { name: "Add to pantry" }),
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.list,
            {
                ingredients: [
                    {
                        id: 5,
                        ingredient_name: INGREDIENT_NAME,
                        quantity_person_ingradient: 4,
                    },
                ],
            },
        );
    });

    it("should close the delete confirmation modal when Cancel is clicked", async () => {
        setup();

        await screen.findByText(INGREDIENT_NAME);

        await userEvent.click(screen.getByRole("button", { name: "Delete" }));
        await screen.findByText(deleteMessage);
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
        await userEvent.click(
            within(await screen.findByRole("dialog")).getByRole("button", {
                name: "Delete",
            }),
        );

        // the refetch after the Pantry invalidation is async, so wait for the empty state first
        await screen.findByText("You currently have no ingredients.");
        expect(screen.queryByText(INGREDIENT_NAME)).not.toBeInTheDocument();
    });

    it("should filter ingredients by the search box", async () => {
        jest.useFakeTimers();
        const user = setupUser();

        try {
            setup();

            await screen.findByText(INGREDIENT_NAME);
            await user.type(
                screen.getByPlaceholderText("Search your pantry…"),
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
                lots: [],
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
