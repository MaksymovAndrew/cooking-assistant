import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { ShoppingListItem } from "types/shoppingList";

import { API_ROUTES } from "api/endpoints";

import ShoppingListPage from "app/(private)/shopping-list/page";
import {
    mockedDelete,
    mockedGet,
    mockedPatch,
    mockedPost,
    mockedPut,
} from "test/apiClientMock";
import { renderWithProviders } from "test/router";

jest.mock("api/client");

const MILK: ShoppingListItem = {
    id: 1,
    name: "Oat milk",
    note: "2 packs",
    ingredient_id: null,
    ingredient_slug: null,
    unit_name: null,
    quantity: null,
    checked: false,
    position: 0,
};
const FLOUR: ShoppingListItem = {
    id: 2,
    name: "Flour",
    note: null,
    ingredient_id: 7,
    ingredient_slug: "flour",
    unit_name: "g",
    quantity: 333.3333,
    checked: false,
    position: 1,
};
const BREAD: ShoppingListItem = {
    id: 3,
    name: "Bread",
    note: null,
    ingredient_id: null,
    ingredient_slug: null,
    unit_name: null,
    quantity: null,
    checked: true,
    position: 2,
};

const TO_BUY_HEADING = "To buy";
const BOUGHT_HEADING = "Bought";

const sectionOf = (heading: string): HTMLElement =>
    screen.getByRole("region", { name: heading });

// a copy per response, since the cache freezes what it stores and a test may still change the server list
const setup = (items: ShoppingListItem[] = [MILK, FLOUR, BREAD]) => {
    mockedGet.mockImplementation((url: string) =>
        url === API_ROUTES.shoppingList.list
            ? Promise.resolve({ data: [...items] })
            : Promise.reject(new Error(`unexpected GET ${url}`)),
    );

    return renderWithProviders(<ShoppingListPage />);
};

describe("ShoppingListPage", () => {
    it("should split the list into items to buy and bought items", async () => {
        setup();

        await screen.findByText(MILK.name);

        expect(
            within(sectionOf(TO_BUY_HEADING)).getByText(MILK.name),
        ).toBeInTheDocument();
        expect(
            within(sectionOf(BOUGHT_HEADING)).getByText(BREAD.name),
        ).toBeInTheDocument();
        expect(screen.getByText("2 items to buy")).toBeInTheDocument();
    });

    it("should show a catalog item's rounded quantity with its unit, and a note", async () => {
        setup();

        await screen.findByText(MILK.name);

        expect(screen.getByText(/333\.33/)).toBeInTheDocument();
        expect(screen.getByText(MILK.note ?? "")).toBeInTheDocument();
    });

    it("should show the empty state when the list has no items", async () => {
        setup([]);

        expect(
            await screen.findByText("Your shopping list is empty"),
        ).toBeInTheDocument();
    });

    it("should add a trimmed item and clear the form once it is saved", async () => {
        mockedPost.mockResolvedValue({ data: { ...MILK, id: 9 } });
        setup([]);

        await screen.findByText("Your shopping list is empty");
        const nameInput = screen.getByRole("textbox", { name: "Item" });

        await userEvent.type(nameInput, "  Eggs ");
        await userEvent.click(screen.getByRole("button", { name: "Add" }));

        expect(mockedPost).toHaveBeenCalledWith(API_ROUTES.shoppingList.list, {
            name: "Eggs",
            note: null,
        });
        expect(nameInput).toHaveValue("");
    });

    it("should move a ticked item to the bought section", async () => {
        const items = [MILK, FLOUR, BREAD];

        mockedPatch.mockImplementation(() => {
            items[0] = { ...MILK, checked: true };

            return Promise.resolve({ data: items[0] });
        });
        setup(items);

        await userEvent.click(
            await screen.findByRole("checkbox", { name: /Oat milk/ }),
        );

        expect(mockedPatch).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.byId(MILK.id),
            { checked: true },
        );
        expect(
            within(sectionOf(BOUGHT_HEADING)).getByText(MILK.name),
        ).toBeInTheDocument();
    });

    it("should untick the item again when saving the tick fails", async () => {
        mockedPatch.mockRejectedValue(new Error("offline"));
        setup();

        const checkbox = await screen.findByRole("checkbox", {
            name: /Oat milk/,
        });

        await userEvent.click(checkbox);

        expect(
            within(sectionOf(TO_BUY_HEADING)).getByRole("checkbox", {
                name: /Oat milk/,
            }),
        ).not.toBeChecked();
    });

    it("should send the whole list in its new order when an item moves down", async () => {
        mockedPut.mockResolvedValue({ data: null });
        setup();

        await userEvent.click(
            await screen.findByRole("button", { name: "Move Oat milk down" }),
        );

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.shoppingList.order, {
            ids: [FLOUR.id, MILK.id, BREAD.id],
        });
    });

    it("should not let the first item move up or the last item move down", async () => {
        setup();

        await screen.findByText(MILK.name);
        const toBuy = within(sectionOf(TO_BUY_HEADING));
        const upButtons = toBuy.getAllByRole("button", { name: / up$/ });
        const downButtons = toBuy.getAllByRole("button", { name: / down$/ });

        expect(upButtons[0]).toBeDisabled();
        expect(upButtons[1]).toBeEnabled();
        expect(downButtons[0]).toBeEnabled();
        expect(downButtons[1]).toBeDisabled();
    });

    it("should remove an item and clear the bought ones", async () => {
        mockedDelete.mockResolvedValue({ data: null });
        setup();

        await userEvent.click(
            await screen.findByRole("button", { name: "Remove Oat milk" }),
        );
        await userEvent.click(
            screen.getByRole("button", { name: "Clear bought" }),
        );

        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.byId(MILK.id),
            { data: undefined, params: undefined },
        );
        expect(mockedDelete).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.checked,
            { data: undefined, params: undefined },
        );
    });
});
