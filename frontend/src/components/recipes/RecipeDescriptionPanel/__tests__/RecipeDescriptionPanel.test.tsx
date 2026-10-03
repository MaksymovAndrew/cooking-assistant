import { screen, within } from "@testing-library/react";

import { API_ROUTES } from "api/endpoints";

import { RecipeDescriptionPanel } from "components/recipes/RecipeDescriptionPanel";

import { mockGetByUrl } from "test/apiClientMock";
import { renderWithProviders, renderWithRouter } from "test/router";
import { makeTestStore } from "test/store";

jest.mock("api/client");

const AVOIDED_NOTE = "You avoid this";

describe("RecipeDescriptionPanel", () => {
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

        expect(await screen.findByText(AVOIDED_NOTE)).toBeInTheDocument();
        expect(
            within(screen.getByText("Milk")).getByText(AVOIDED_NOTE),
        ).toBeInTheDocument();
        expect(
            within(screen.getByText("Gluten")).queryByText(AVOIDED_NOTE),
        ).not.toBeInTheDocument();
    });
});
