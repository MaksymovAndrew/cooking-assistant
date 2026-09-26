import { screen } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { RecipeDescriptionPanel } from "components/recipes/RecipeDescriptionPanel";

import { mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders, renderWithRouter } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

describe("RecipeDescriptionPanel", () => {
    it("should render the description text", () => {
        renderWithRouter(
            <RecipeDescriptionPanel
                content="A deeply savoury slow-cooked ragù."
                language="en"
                allergens={[]}
            />,
        );

        expect(
            screen.getByText("A deeply savoury slow-cooked ragù."),
        ).toBeInTheDocument();
    });

    it("should not show the allergens section when there are none", () => {
        renderWithRouter(
            <RecipeDescriptionPanel
                content="Tasty."
                language="en"
                allergens={[]}
            />,
        );

        expect(screen.queryByText("Allergens")).not.toBeInTheDocument();
    });

    it("should list every allergen when present", () => {
        renderWithRouter(
            <RecipeDescriptionPanel
                content="Tasty."
                language="en"
                allergens={["gluten", "milk"]}
            />,
        );

        expect(screen.getByText("Allergens")).toBeInTheDocument();
        expect(screen.getByText("Gluten")).toBeInTheDocument();
        expect(screen.getByText("Milk")).toBeInTheDocument();
    });

    it("should mark the allergens the signed-in viewer avoids", async () => {
        mockGetByUrl({
            [API_ROUTES.dietPreferences.get]: {
                allergens: ["milk"],
                ingredient_ids: [],
            },
        });

        renderWithProviders(
            <RecipeDescriptionPanel
                content="Tasty."
                language="en"
                allergens={["gluten", "milk"]}
            />,
            { store: makeTestStore({ session: { status: "authed" } }) },
        );

        expect(await screen.findByText("You avoid this")).toBeInTheDocument();
        expect(screen.getByText("Milk")).toHaveClass(
            "recipe-description-panel__allergen--avoided",
        );
        expect(screen.getByText("Gluten")).not.toHaveClass(
            "recipe-description-panel__allergen--avoided",
        );
    });
});
