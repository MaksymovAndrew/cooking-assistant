import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Purchase } from "types/userIngredient";

import { PurchaseItem } from "components/ingredients/PurchaseItem";

const BTN_EDIT_QUANTITY = "Edit quantity";

const FRESH: Purchase = {
    id: 1,
    quantity: 500,
    purchase_date: "2099-01-01T00:00:00.000Z",
    unit_name: "g",
    days_to_expire: 365,
};

const EXPIRED: Purchase = {
    id: 2,
    quantity: 200,
    purchase_date: "2020-01-01T00:00:00.000Z",
    unit_name: "ml",
    days_to_expire: 1,
};

const setup = (
    purchase: Purchase,
    onQuantityChange = jest.fn(),
    onSave = jest
        .fn<Promise<void>, [number, number]>()
        .mockResolvedValue(undefined),
    onDelete = jest.fn(),
) => {
    render(
        <PurchaseItem
            purchase={purchase}
            ingredientName="Potato"
            onQuantityChange={onQuantityChange}
            onSave={onSave}
            onDelete={onDelete}
        />,
    );

    return { onQuantityChange, onSave, onDelete };
};

const startEditing = async () => {
    await userEvent.click(
        screen.getByRole("button", { name: BTN_EDIT_QUANTITY }),
    );
};

describe("PurchaseItem", () => {
    it("should render the quantity and unit as read-only text", () => {
        setup(FRESH);

        expect(screen.getByText("500")).toBeInTheDocument();
        expect(screen.getByText("g")).toBeInTheDocument();
        expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    });

    it("should label an expired purchase as expired and leave a fresh one unlabelled", () => {
        render(
            <ul>
                {[FRESH, EXPIRED].map((purchase) => (
                    <PurchaseItem
                        key={purchase.id}
                        purchase={purchase}
                        ingredientName="Potato"
                        onQuantityChange={jest.fn()}
                        onSave={jest.fn(() => Promise.resolve())}
                        onDelete={jest.fn()}
                    />
                ))}
            </ul>,
        );

        const [fresh, expired] = screen.getAllByRole("listitem");

        expect(within(expired).getByText("Expired")).toBeInTheDocument();
        expect(within(fresh).queryByText("Expired")).not.toBeInTheDocument();
    });

    it("should show the quantity input after clicking the edit button", async () => {
        setup(FRESH);

        await startEditing();

        expect(screen.getByDisplayValue("500")).toBeInTheDocument();
    });

    it("should call onQuantityChange with the purchase id and new value on change", async () => {
        const { onQuantityChange } = setup(FRESH);

        await startEditing();

        const input = screen.getByRole("spinbutton");

        await userEvent.type(input, "1");

        expect(onQuantityChange).toHaveBeenCalledWith(FRESH.id, 5001);
    });

    it("should call onSave with the purchase id and current value on blur", async () => {
        const { onSave } = setup(FRESH);

        await startEditing();

        const input = screen.getByRole("spinbutton");

        await userEvent.click(input);
        await userEvent.tab();

        expect(onSave).toHaveBeenCalledWith(FRESH.id, FRESH.quantity);
    });

    it("should return to read-only text after blur", async () => {
        setup(FRESH);

        await startEditing();
        await userEvent.tab();

        expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: BTN_EDIT_QUANTITY }),
        ).toBeInTheDocument();
    });

    it("should save the original value on blur after clearing (never 0)", async () => {
        const { onSave } = setup(FRESH);

        await startEditing();

        const input = screen.getByRole("spinbutton");

        await userEvent.clear(input);
        await userEvent.tab();

        expect(onSave).toHaveBeenCalledWith(FRESH.id, FRESH.quantity);
        expect(onSave).not.toHaveBeenCalledWith(FRESH.id, 0);
    });

    it("should ask to delete this purchase when the delete button is pressed", async () => {
        const onDelete = jest.fn();

        setup(FRESH, jest.fn(), undefined, onDelete);

        await userEvent.click(
            screen.getByRole("button", { name: "Delete purchase" }),
        );

        expect(onDelete).toHaveBeenCalledWith(FRESH.id);
    });

    it("should label the quantity field with the ingredient and the purchase date", async () => {
        setup(FRESH);

        await startEditing();

        expect(
            screen.getByRole("spinbutton", {
                name: "Quantity of Potato bought Jan 1",
            }),
        ).toHaveFocus();
    });

    it("should save once on Enter and hand focus back to the edit button", async () => {
        const { onSave } = setup(FRESH);

        await startEditing();
        await userEvent.type(screen.getByRole("spinbutton"), "{Enter}");

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(
            screen.getByRole("button", { name: BTN_EDIT_QUANTITY }),
        ).toHaveFocus();
    });

    it("should leave focus where the user moved it after leaving the field", async () => {
        render(
            <>
                <PurchaseItem
                    purchase={FRESH}
                    ingredientName="Potato"
                    onQuantityChange={jest.fn()}
                    onSave={jest.fn(() => Promise.resolve())}
                    onDelete={jest.fn()}
                />
                <button type="button">Next</button>
            </>,
        );

        await startEditing();
        await userEvent.tab();

        expect(screen.getByRole("button", { name: "Next" })).toHaveFocus();
    });

    it("should ignore other keys while editing", async () => {
        const { onSave } = setup(FRESH);

        await startEditing();
        await userEvent.type(screen.getByRole("spinbutton"), "{Escape}");

        expect(onSave).not.toHaveBeenCalled();
    });
});
