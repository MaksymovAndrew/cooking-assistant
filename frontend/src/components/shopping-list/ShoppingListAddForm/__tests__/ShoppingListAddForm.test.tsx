import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ShoppingListAddForm } from "components/shopping-list/ShoppingListAddForm";

import { renderWithRouter } from "test/router";

describe("ShoppingListAddForm", () => {
    it("should pass the name and note to onAdd and clear both once it succeeds", async () => {
        const onAdd = jest.fn().mockResolvedValue(true);

        renderWithRouter(
            <ShoppingListAddForm onAdd={onAdd} isAdding={false} />,
        );

        await userEvent.type(
            screen.getByRole("textbox", { name: "Item" }),
            "Eggs",
        );
        await userEvent.type(
            screen.getByRole("textbox", { name: "Note" }),
            "free range{Enter}",
        );

        expect(onAdd).toHaveBeenCalledWith("Eggs", "free range");
        expect(screen.getByRole("textbox", { name: "Item" })).toHaveValue("");
        expect(screen.getByRole("textbox", { name: "Note" })).toHaveValue("");
    });

    it("should keep the typed item when onAdd fails", async () => {
        const onAdd = jest.fn().mockResolvedValue(false);

        renderWithRouter(
            <ShoppingListAddForm onAdd={onAdd} isAdding={false} />,
        );

        await userEvent.type(
            screen.getByRole("textbox", { name: "Item" }),
            "Eggs{Enter}",
        );

        expect(screen.getByRole("textbox", { name: "Item" })).toHaveValue(
            "Eggs",
        );
    });

    it("should not submit again from the keyboard while an add is in flight", async () => {
        const onAdd = jest.fn().mockResolvedValue(true);

        renderWithRouter(<ShoppingListAddForm onAdd={onAdd} isAdding />);

        await userEvent.type(
            screen.getByRole("textbox", { name: "Item" }),
            "Eggs{Enter}",
        );

        expect(onAdd).not.toHaveBeenCalled();
    });

    it("should not submit a blank item", async () => {
        const onAdd = jest.fn().mockResolvedValue(true);

        renderWithRouter(
            <ShoppingListAddForm onAdd={onAdd} isAdding={false} />,
        );

        await userEvent.type(
            screen.getByRole("textbox", { name: "Item" }),
            "   {Enter}",
        );

        expect(onAdd).not.toHaveBeenCalled();
    });
});
