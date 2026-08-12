import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuDetailRecipe } from "types/menu";

import { MenuDetailsSecondary } from "pages/menu/MenuDetailsSecondary";
import { renderWithProviders } from "test/router";
import { makeTestStore } from "test/store";

const LOG_INTAKE_BUTTON = "Log intake";
const FAVOURITE_BUTTON = "Favourite";
const GUEST_CTA = "Log in for the full experience";
const CHANGE_MENU_PATH = "/change-menu/1";
const AUTHED_STORE = makeTestStore({ session: { status: "authed" } });
const GUEST_STORE = makeTestStore({ session: { status: "guest" } });

const RECIPE: MenuDetailRecipe = {
    recipe_id: 1,
    title: "Soup",
    type_name: "Soup",
    cooking_time: 30,
    creation_date: "2024-01-01",
    calories_per_portion: null,
    missingIngredients: [
        {
            ingredient_id: 7,
            ingredient_slug: "carrot",
            ingredient_name: "Carrot",
            needed_quantity: 2,
            missing_quantity: 2,
            unit_name: "piece",
        },
    ],
};

const baseProps = {
    recipes: [RECIPE],
    allergens: [],
    addRecipesTo: CHANGE_MENU_PATH,
    editTo: CHANGE_MENU_PATH,
    onDelete: jest.fn(),
};

describe("MenuDetailsSecondary", () => {
    it("should render ingredients before actions before recipes in DOM order", () => {
        renderWithProviders(
            <MenuDetailsSecondary {...baseProps} isOwner={false} />,
            { store: AUTHED_STORE },
        );

        const positions = [
            screen
                .getByText("Carrot")
                .compareDocumentPosition(
                    screen.getByRole("button", { name: FAVOURITE_BUTTON }),
                ),
            screen
                .getByRole("button", { name: FAVOURITE_BUTTON })
                .compareDocumentPosition(screen.getByText("Soup")),
        ];

        // DOCUMENT_POSITION_FOLLOWING (4): the second node comes after the first
        expect(positions[0] & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
        expect(positions[1] & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it("should show just the Favourite button and no explanatory text for a visitor", () => {
        renderWithProviders(
            <MenuDetailsSecondary {...baseProps} isOwner={false} />,
            { store: AUTHED_STORE },
        );

        expect(
            screen.queryByRole("link", { name: /Edit menu/ }),
        ).not.toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: FAVOURITE_BUTTON }),
        ).toBeInTheDocument();
    });

    it("should show owner actions and call onDelete when the viewer owns the menu", async () => {
        const onDelete = jest.fn();

        renderWithProviders(
            <MenuDetailsSecondary {...baseProps} isOwner onDelete={onDelete} />,
            { store: AUTHED_STORE },
        );

        expect(screen.getByRole("link", { name: /Edit menu/ })).toHaveAttribute(
            "href",
            CHANGE_MENU_PATH,
        );

        await userEvent.click(
            screen.getByRole("button", { name: /Delete menu/ }),
        );

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("should show the log-intake button next to Favourite and call onLogIntake for a visitor", async () => {
        const onLogIntake = jest.fn();

        renderWithProviders(
            <MenuDetailsSecondary
                {...baseProps}
                isOwner={false}
                onLogIntake={onLogIntake}
            />,
            { store: AUTHED_STORE },
        );

        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });

    it("should not show the log-intake button when onLogIntake is not provided", () => {
        renderWithProviders(
            <MenuDetailsSecondary {...baseProps} isOwner={false} />,
            { store: AUTHED_STORE },
        );

        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_BUTTON }),
        ).not.toBeInTheDocument();
    });

    it("should hide the favourite button for a guest", () => {
        renderWithProviders(
            <MenuDetailsSecondary {...baseProps} isOwner={false} />,
            { store: GUEST_STORE },
        );

        expect(
            screen.queryByRole("button", { name: FAVOURITE_BUTTON }),
        ).not.toBeInTheDocument();
    });

    it("should show a generic login CTA instead of the log-intake button for a guest", () => {
        renderWithProviders(
            <MenuDetailsSecondary
                {...baseProps}
                isOwner={false}
                onLogIntake={jest.fn()}
            />,
            { store: GUEST_STORE },
        );

        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_BUTTON }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: GUEST_CTA })).toHaveAttribute(
            "href",
            "/login",
        );
    });

    it("should show a log-intake trigger for an owner and call onLogIntake when clicked", async () => {
        const onLogIntake = jest.fn();

        renderWithProviders(
            <MenuDetailsSecondary
                {...baseProps}
                isOwner
                onLogIntake={onLogIntake}
            />,
            { store: AUTHED_STORE },
        );

        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });
});
