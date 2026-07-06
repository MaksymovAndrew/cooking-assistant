import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Purchase } from "types/userIngredient";

import { PurchaseItem } from "components/ingredients/PurchaseItem";

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
) => {
    render(
        <PurchaseItem
            purchase={purchase}
            language="en"
            onQuantityChange={onQuantityChange}
            onSave={onSave}
        />,
    );

    return { onQuantityChange, onSave };
};

describe("PurchaseItem", () => {
    it("should render the unit and quantity", () => {
        setup(FRESH);

        expect(screen.getByDisplayValue("500")).toBeInTheDocument();
        expect(screen.getByText("g")).toBeInTheDocument();
    });

    it("should not apply the expired modifier class when not expired", () => {
        setup(FRESH);

        expect(screen.getByRole("listitem")).not.toHaveClass(
            "purchase-item--expired",
        );
    });

    it("should apply the expired modifier class when the purchase has expired", () => {
        setup(EXPIRED);

        expect(screen.getByRole("listitem")).toHaveClass(
            "purchase-item--expired",
        );
    });

    it("should call onQuantityChange with the purchase id and new value on change", async () => {
        const { onQuantityChange } = setup(FRESH);
        const input = screen.getByRole("spinbutton");

        await userEvent.type(input, "1");

        expect(onQuantityChange).toHaveBeenCalledWith(FRESH.id, 5001);
    });

    it("should call onSave with the purchase id and current value on blur", async () => {
        const { onSave } = setup(FRESH);
        const input = screen.getByRole("spinbutton");

        await userEvent.click(input);
        await userEvent.tab();

        expect(onSave).toHaveBeenCalledWith(FRESH.id, FRESH.quantity);
    });

    it("should enforce a minimum value of 1", () => {
        setup(FRESH);

        expect(screen.getByRole("spinbutton")).toHaveAttribute("min", "1");
    });

    it("should save the original value on blur after clearing (never 0)", async () => {
        const { onSave } = setup(FRESH);
        const input = screen.getByRole("spinbutton");

        await userEvent.clear(input);
        await userEvent.tab();

        expect(onSave).toHaveBeenCalledWith(FRESH.id, FRESH.quantity);
        expect(onSave).not.toHaveBeenCalledWith(FRESH.id, 0);
    });

    it("should not call onQuantityChange when the input is cleared", async () => {
        const { onQuantityChange } = setup(FRESH);
        const input = screen.getByRole("spinbutton");

        await userEvent.clear(input);

        expect(onQuantityChange).not.toHaveBeenCalled();
    });
});
