import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ROUTES } from "constants/routes";
import type { ExpiringIngredient } from "types/expiry";

import { API_ROUTES } from "api/endpoints";

import { ExpiringSoon } from "components/home/ExpiringSoon";

import { makeAxiosError, mockedPost } from "test/apiClientMock";
import { renderWithProviders, renderWithRouter } from "test/router";

jest.mock("api/client");

const ADD_BUTTON = "+ Add to shopping list";

const ITEM: ExpiringIngredient = {
    ingredientId: 1,
    slug: "milk",
    name: "Milk",
    status: { tone: "warning", days: 2 },
};

describe("ExpiringSoon", () => {
    it("should render a row for each expiring item and a link to the pantry", () => {
        renderWithRouter(<ExpiringSoon items={[ITEM]} restockItems={[ITEM]} />);

        expect(screen.getByText("Milk")).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Pantry →" })).toHaveAttribute(
            "href",
            "/ingredients",
        );
    });

    it("should show an empty message when nothing is expiring", () => {
        renderWithRouter(<ExpiringSoon items={[]} restockItems={[]} />);

        expect(screen.getByText("Nothing expiring soon.")).toBeInTheDocument();
    });

    it("should put the expiring items on the shopping list without quantities and link to the list", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const { store } = renderWithProviders(
            <ExpiringSoon items={[ITEM]} restockItems={[ITEM]} />,
        );

        await userEvent.click(screen.getByRole("button", { name: ADD_BUTTON }));

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.ingredients,
            { items: [{ ingredient_id: ITEM.ingredientId, quantity: null }] },
        );
        expect(store.getState().notifications.items).toEqual([
            expect.objectContaining({
                type: "success",
                message: "Added to your shopping list.",
                link: { href: ROUTES.shoppingList, label: "Open list" },
            }),
        ]);
    });

    it("should restock every urgent ingredient, not only the ones listed", async () => {
        mockedPost.mockResolvedValue({ data: null });
        const hidden = {
            ...ITEM,
            ingredientId: 2,
            slug: "cream",
            name: "Cream",
        };

        renderWithRouter(
            <ExpiringSoon items={[ITEM]} restockItems={[ITEM, hidden]} />,
        );

        await userEvent.click(screen.getByRole("button", { name: ADD_BUTTON }));

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.ingredients,
            {
                items: [
                    { ingredient_id: ITEM.ingredientId, quantity: null },
                    { ingredient_id: hidden.ingredientId, quantity: null },
                ],
            },
        );
    });

    it("should not confirm the add when the request fails", async () => {
        mockedPost.mockRejectedValue(makeAxiosError(409, "List is full"));
        const { store } = renderWithProviders(
            <ExpiringSoon items={[ITEM]} restockItems={[ITEM]} />,
        );

        await userEvent.click(screen.getByRole("button", { name: ADD_BUTTON }));

        expect(
            store
                .getState()
                .notifications.items.some((item) => item.type === "success"),
        ).toBe(false);
    });

    it("should disable the add action when nothing is expiring", () => {
        renderWithRouter(<ExpiringSoon items={[]} restockItems={[]} />);

        expect(screen.getByRole("button", { name: ADD_BUTTON })).toBeDisabled();
    });
});
