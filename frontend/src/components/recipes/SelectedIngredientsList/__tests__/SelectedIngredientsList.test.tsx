import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SelectedIngredientsList } from "components/recipes/SelectedIngredientsList";

const INGREDIENTS = [
    {
        id: 1,
        slug: "potato",
        name: "Potato",
        quantity: 3,
        unit_name: "g",
        calories_per_unit: null,
    },
];

const TWO_INGREDIENTS = [
    ...INGREDIENTS,
    {
        id: 2,
        slug: "onion",
        name: "Onion",
        quantity: 1,
        unit_name: "g",
        calories_per_unit: null,
    },
];

describe("SelectedIngredientsList", () => {
    it("should name the quantity field after its ingredient", () => {
        render(
            <SelectedIngredientsList
                ingredients={INGREDIENTS}
                onQuantityChange={jest.fn()}
                onRemove={jest.fn()}
                onReorder={jest.fn()}
            />,
        );

        expect(
            screen.getByRole("spinbutton", { name: "Quantity of Potato" }),
        ).toHaveValue(3);
    });

    it("should call onQuantityChange with the parsed number when the quantity changes", async () => {
        const onQuantityChange = jest.fn();

        render(
            <SelectedIngredientsList
                ingredients={INGREDIENTS}
                onQuantityChange={onQuantityChange}
                onRemove={jest.fn()}
                onReorder={jest.fn()}
            />,
        );

        await userEvent.type(screen.getByRole("spinbutton"), "5");

        expect(onQuantityChange).toHaveBeenCalledWith(1, 35);
    });

    it("should call onRemove with the ingredient id when the remove button is clicked", async () => {
        const onRemove = jest.fn();

        render(
            <SelectedIngredientsList
                ingredients={INGREDIENTS}
                onQuantityChange={jest.fn()}
                onRemove={onRemove}
                onReorder={jest.fn()}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Remove Potato" }),
        );

        expect(onRemove).toHaveBeenCalledWith(INGREDIENTS[0].id);
    });

    it("should move an ingredient down by landing the next one before it", async () => {
        const onReorder = jest.fn();

        render(
            <SelectedIngredientsList
                ingredients={TWO_INGREDIENTS}
                onQuantityChange={jest.fn()}
                onRemove={jest.fn()}
                onReorder={onReorder}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Move Potato down" }),
        );

        expect(onReorder).toHaveBeenCalledWith(2, 1);
    });

    it("should move an ingredient up by landing it before the previous one", async () => {
        const onReorder = jest.fn();

        render(
            <SelectedIngredientsList
                ingredients={TWO_INGREDIENTS}
                onQuantityChange={jest.fn()}
                onRemove={jest.fn()}
                onReorder={onReorder}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: "Move Onion up" }),
        );

        expect(onReorder).toHaveBeenCalledWith(2, 1);
    });
});
