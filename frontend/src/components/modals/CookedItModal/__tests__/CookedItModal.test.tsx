import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { CookRequirement, CookSummary } from "types/pantryConsumption";
import type { UserIngredient } from "types/userIngredient";

import { API_ROUTES } from "api/endpoints";

import { selectActiveModal } from "redux/selectors/uiSelectors";

import { CookedItModal } from "components/modals/CookedItModal";

import { mockedPost, mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const CONFIRM = "Cooked it";

const requirement = (
    ingredientId: number,
    slug: string,
    quantity: number,
): CookRequirement => ({
    ingredient_id: ingredientId,
    slug,
    name: slug,
    unit_name: "g",
    quantity,
});

const REQUIREMENTS = [
    requirement(1, "flour", 200),
    requirement(2, "sugar", 50),
    requirement(3, "salt", 5),
];

const inPantry = (ingredientId: number, quantity: number): UserIngredient => ({
    ingredient_id: ingredientId,
    ingredient_slug: "item",
    ingredient_name: "Item",
    category: "baking",
    unit_name: "g",
    quantity_person_ingradient: quantity,
    allergens: [],
    lots: [{ id: ingredientId, quantity, purchase_date: "2026-01-01" }],
});

const SUMMARY: CookSummary = {
    consumptionId: 42,
    deducted: [],
    skipped: [],
    calorieIntake: null,
};

const setup = (caloriesPerPortion: number | null = 310) => {
    mockGetByUrl({
        [API_ROUTES.userIngredients.list]: [inPantry(1, 500), inPantry(2, 20)],
    });

    const store = makeTestStore({
        ui: {
            queue: [
                {
                    id: "m1",
                    type: "cookedIt",
                    recipeId: 7,
                    title: "Pancakes",
                    requirements: REQUIREMENTS,
                    caloriesPerPortion,
                },
            ],
        },
    });

    return renderWithProviders(
        <CookedItModal
            modalId="m1"
            recipeId={7}
            title="Pancakes"
            requirements={REQUIREMENTS}
            caloriesPerPortion={caloriesPerPortion}
        />,
        { store },
    );
};

describe("CookedItModal", () => {
    it("should list what will be taken and flag what the pantry lacks", async () => {
        setup();

        expect(await screen.findByText("200 g")).toBeInTheDocument();
        expect(
            screen.getByText("Only 20 g left - it will all be used"),
        ).toBeInTheDocument();
        expect(
            screen.getByText("Not in your pantry - skipped"),
        ).toBeInTheDocument();
    });

    it("should scale the amounts with the portions", async () => {
        setup();

        await userEvent.click(
            await screen.findByRole("button", { name: "More portions" }),
        );

        expect(screen.getByText("400 g")).toBeInTheDocument();
    });

    it("should hide the calorie option when the calories are unknown", async () => {
        setup(null);

        await screen.findByText("200 g");

        expect(
            screen.queryByRole("switch", { name: "Also log the calories" }),
        ).not.toBeInTheDocument();
    });

    it("should cook with the chosen portions and calorie choice, close and offer an undo", async () => {
        mockedPost.mockResolvedValue({ data: SUMMARY });
        const { store } = setup();

        await userEvent.click(
            await screen.findByRole("switch", {
                name: "Also log the calories",
            }),
        );
        await userEvent.click(screen.getByRole("button", { name: CONFIRM }));

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.userIngredients.cook,
            {
                recipe_id: 7,
                menu_id: undefined,
                portions: 1,
                log_calories: true,
            },
        );
        expect(selectActiveModal(store.getState())).toBeNull();
        expect(store.getState().notifications.items[0].action).toEqual({
            kind: "undoCooking",
            consumptionId: 42,
            label: "Undo",
        });
    });

    it("should send one request however fast the button is pressed twice", async () => {
        mockedPost.mockResolvedValue({ data: SUMMARY });
        setup();

        await userEvent.dblClick(
            await screen.findByRole("button", { name: CONFIRM }),
        );

        expect(mockedPost).toHaveBeenCalledTimes(1);
    });

    it("should close without cooking on cancel", async () => {
        const { store } = setup();

        await userEvent.click(
            await screen.findByRole("button", { name: "Cancel" }),
        );

        expect(mockedPost).not.toHaveBeenCalled();
        expect(selectActiveModal(store.getState())).toBeNull();
    });
});
