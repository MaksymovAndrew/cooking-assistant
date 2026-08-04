import { screen } from "@testing-library/react";

import { MenuRecipeCard } from "components/menu/MenuRecipeCard";

import { renderWithRouter } from "test/router";

const RECIPE = {
    id: 7,
    title: "Slow-roasted ragù",
    type_name: "Main course",
    cooking_time: 85,
    calories_per_portion: null,
};

describe("MenuRecipeCard", () => {
    it("should link to the recipe details page", () => {
        renderWithRouter(<MenuRecipeCard recipe={RECIPE} />);

        expect(
            screen.getByRole("link", { name: /Slow-roasted ragù/ }),
        ).toHaveAttribute("href", "/recipe/7");
    });

    it("should show the type and cooking time as compact meta text", () => {
        renderWithRouter(<MenuRecipeCard recipe={RECIPE} />);

        expect(screen.getByText("Main course · 1h 25m")).toBeInTheDocument();
    });

    it("should format the cooking time in minutes only when under an hour", () => {
        renderWithRouter(
            <MenuRecipeCard recipe={{ ...RECIPE, cooking_time: 20 }} />,
        );

        expect(screen.getByText("Main course · 20 min")).toBeInTheDocument();
    });

    it("should append the calorie total to the meta text when available", () => {
        renderWithRouter(
            <MenuRecipeCard
                recipe={{ ...RECIPE, calories_per_portion: 320 }}
            />,
        );

        expect(
            screen.getByText("Main course · 1h 25m · 320 kcal"),
        ).toBeInTheDocument();
    });
});
