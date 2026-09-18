import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { API_ROUTES } from "api/endpoints";

import { MenuMissingIngredientsPanel } from "components/menu/MenuMissingIngredientsPanel";

import { mockedPost } from "test/apiClientMock";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const AUTHED_STORE = makeTestStore({ session: { status: "authed" } });
const GUEST_STORE = makeTestStore({ session: { status: "guest" } });

describe("MenuMissingIngredientsPanel", () => {
    it("should render the section heading, count badge and each missing ingredient", () => {
        renderWithProviders(
            <MenuMissingIngredientsPanel
                ingredients={{
                    1: {
                        slug: "tomato",
                        name: "Tomato",
                        quantity: 2,
                        missingQuantity: 2,
                        unit: "kg",
                        sufficient: false,
                    },
                }}
                allergens={[]}
            />,
            { store: AUTHED_STORE },
        );

        expect(screen.getByText("Ingredients")).toBeInTheDocument();
        expect(screen.getByText("1")).toBeInTheDocument();
        expect(screen.getByText("Tomato")).toBeInTheDocument();
        expect(screen.getByText("2 kilogram")).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Go to pantry" }),
        ).toHaveAttribute("href", "/ingredients");
    });

    it("should show what is still short for a partly stocked ingredient", () => {
        renderWithProviders(
            <MenuMissingIngredientsPanel
                ingredients={{
                    1: {
                        slug: "tomato",
                        name: "Tomato",
                        quantity: 3,
                        missingQuantity: 1.25,
                        unit: "kg",
                        sufficient: false,
                    },
                }}
                allergens={[]}
            />,
            { store: AUTHED_STORE },
        );

        expect(screen.getByText("1.25 kilogram")).toBeInTheDocument();
    });

    it("should send only the shortfall of the missing ingredients to the shopping list", async () => {
        mockedPost.mockResolvedValue({ data: null });
        renderWithProviders(
            <MenuMissingIngredientsPanel
                ingredients={{
                    1: {
                        slug: "tomato",
                        name: "Tomato",
                        quantity: 0.5,
                        missingQuantity: 0.1 + 0.2,
                        unit: "kg",
                        sufficient: false,
                    },
                    2: {
                        slug: "onion",
                        name: "Onion",
                        quantity: 1,
                        missingQuantity: 0,
                        unit: "piece",
                        sufficient: true,
                    },
                }}
                allergens={[]}
            />,
            { store: makeTestStore({ session: { status: "authed" } }) },
        );

        await userEvent.click(
            screen.getByRole("button", {
                name: "Add missing to shopping list",
            }),
        );

        expect(mockedPost).toHaveBeenCalledWith(
            API_ROUTES.shoppingList.ingredients,
            { items: [{ ingredient_id: 1, quantity: 0.3 }] },
        );
    });

    it("should mark a sufficient ingredient as having enough, without counting it in the badge", () => {
        renderWithProviders(
            <MenuMissingIngredientsPanel
                ingredients={{
                    2: {
                        slug: "onion",
                        name: "Onion",
                        quantity: 3,
                        missingQuantity: 0,
                        unit: "piece",
                        sufficient: true,
                    },
                }}
                allergens={[]}
            />,
            { store: AUTHED_STORE },
        );

        expect(screen.queryByText("1")).not.toBeInTheDocument();
        expect(screen.getByText("Onion")).toBeInTheDocument();
        expect(screen.getByText("3 piece")).toBeInTheDocument();
        expect(screen.getByLabelText("You have enough")).toBeInTheDocument();
    });

    it("should show a positive message when the menu has no ingredients", () => {
        renderWithProviders(
            <MenuMissingIngredientsPanel ingredients={{}} allergens={[]} />,
            { store: AUTHED_STORE },
        );

        expect(screen.getByText("Ingredients")).toBeInTheDocument();
        expect(
            screen.getByText("This menu has no ingredients yet."),
        ).toBeInTheDocument();
    });

    it("should render the allergens-across-menu chips when present", () => {
        renderWithProviders(
            <MenuMissingIngredientsPanel
                ingredients={{}}
                allergens={["gluten", "milk"]}
            />,
            { store: AUTHED_STORE },
        );

        expect(screen.getByText("Allergens across menu")).toBeInTheDocument();
        expect(screen.getByText("Gluten")).toBeInTheDocument();
        expect(screen.getByText("Milk")).toBeInTheDocument();
    });

    it("should hide ingredient tracking from a guest but still show allergens", () => {
        renderWithProviders(
            <MenuMissingIngredientsPanel
                ingredients={{
                    1: {
                        slug: "tomato",
                        name: "Tomato",
                        quantity: 2,
                        missingQuantity: 2,
                        unit: "kg",
                        sufficient: false,
                    },
                }}
                allergens={["gluten"]}
            />,
            { store: GUEST_STORE },
        );

        expect(screen.queryByText("Ingredients")).not.toBeInTheDocument();
        expect(screen.queryByText("Tomato")).not.toBeInTheDocument();
        expect(screen.getByText("Allergens across menu")).toBeInTheDocument();
    });

    it("should render nothing for a guest when the menu has no allergens", () => {
        const { container } = renderWithProviders(
            <MenuMissingIngredientsPanel
                ingredients={{
                    1: {
                        slug: "tomato",
                        name: "Tomato",
                        quantity: 2,
                        missingQuantity: 2,
                        unit: "kg",
                        sufficient: false,
                    },
                }}
                allergens={[]}
            />,
            { store: GUEST_STORE },
        );

        expect(container).toBeEmptyDOMElement();
    });
});
