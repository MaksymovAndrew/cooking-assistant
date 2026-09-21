import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { RecipeDetails } from "types/recipe";

import { API_ROUTES } from "api/endpoints";

import { RecipeHero } from "components/recipes/RecipeHero";

import { mediaUrl } from "utils/mediaUrl";

import { mockedPut } from "test/apiClientMock";
import { TEST_AUTHOR, TEST_UNRATED } from "test/constants";
import { renderWithRouter } from "test/router";

jest.mock("api/client");

const RECIPE_TITLE = "Slow-roasted ragù";
const LOG_INTAKE_BUTTON = "Log intake";
const GUEST_CTA = "Log in for the full experience";
const CALORIES_PER_PORTION_LABEL = "420 kcal / portion";
const OVER_BUDGET_TOOLTIP = "Exceeds your remaining calories for today";

const BASE_RECIPE: RecipeDetails = {
    id: 1,
    title: RECIPE_TITLE,
    content: "A deeply savoury slow-cooked ragù.",
    ingredients: [],
    type_id: 1,
    type_name: "Main course",
    cooking_time: 85,
    creation_date: "2024-01-01",
    isOwner: false,
    photo_key: null,
    ...TEST_UNRATED,
    author: TEST_AUTHOR,
    isFavourite: false,
    containsAvoided: false,
    tags: [],
    calories_per_portion: 420,
    calories_override: null,
};

// the server answers isFavourite: null exactly when it rendered the record for an anonymous requester
const GUEST_RECIPE: RecipeDetails = { ...BASE_RECIPE, isFavourite: null };

const baseProps = {
    recipe: BASE_RECIPE,
    portionCount: 1,
    editTo: "/change-recipe/1",
    onDelete: jest.fn(),
};

describe("RecipeHero", () => {
    it("should show a placeholder instead of a duration when the recipe has no cooking time", () => {
        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={{ ...BASE_RECIPE, cooking_time: null }}
            />,
        );

        expect(screen.queryByText("0 min")).not.toBeInTheDocument();
        expect(screen.getAllByText("—").length).toBeGreaterThan(0);
    });

    it("should render the title and type chip", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.getByRole("heading", { name: RECIPE_TITLE }),
        ).toBeInTheDocument();
        expect(screen.getByText("Main course")).toBeInTheDocument();
    });

    it("should show calories per portion", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.getByText(CALORIES_PER_PORTION_LABEL),
        ).toBeInTheDocument();
    });

    it("should show a total for multiple portions", () => {
        renderWithRouter(<RecipeHero {...baseProps} portionCount={3} />);

        expect(screen.getByText("≈ 1,260 kcal total")).toBeInTheDocument();
    });

    it("should not show a total for a single portion", () => {
        renderWithRouter(<RecipeHero {...baseProps} portionCount={1} />);

        expect(screen.queryByText(/kcal total/)).not.toBeInTheDocument();
    });

    it("should show a placeholder when the recipe has no calorie data", () => {
        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={{ ...BASE_RECIPE, calories_per_portion: null }}
            />,
        );

        expect(screen.getByText("—")).toBeInTheDocument();
    });

    it("should recolor the calories stat when exceedsBudget is true", () => {
        renderWithRouter(<RecipeHero {...baseProps} exceedsBudget />);

        expect(screen.getByTitle(OVER_BUDGET_TOOLTIP)).toHaveClass(
            "recipe-hero__stat--calorie-over",
        );
    });

    it("should not recolor the calories stat by default", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.queryByTitle(OVER_BUDGET_TOOLTIP),
        ).not.toBeInTheDocument();
    });

    it("should show just the Favourite button and no explanatory text for a visitor", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.queryByRole("link", { name: /Edit recipe/ }),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(/Viewing someone else's recipe/),
        ).not.toBeInTheDocument();
        expect(
            screen.getAllByRole("button", { name: "Favourite" })[1],
        ).toBeInTheDocument();
    });

    it("should rate the recipe for a signed-in visitor and move the average at once", async () => {
        mockedPut.mockResolvedValue({ data: null });

        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={{ ...BASE_RECIPE, ratingAverage: 3, ratingCount: 1 }}
            />,
        );

        await userEvent.click(screen.getByRole("radio", { name: "5 stars" }));

        expect(mockedPut).toHaveBeenCalledWith(API_ROUTES.recipes.rating(1), {
            value: 5,
        });
        expect(screen.getByRole("radio", { name: "5 stars" })).toBeChecked();
        expect(
            screen.getByRole("img", {
                name: "Rated 4.0 out of 5 from 2 ratings",
            }),
        ).toBeInTheDocument();
    });

    it("should not offer the stars to a guest", () => {
        renderWithRouter(<RecipeHero {...baseProps} recipe={GUEST_RECIPE} />);

        expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();
        expect(
            screen.getByRole("img", { name: "No ratings yet" }),
        ).toBeInTheDocument();
    });

    it("should show owner actions without the stars and call onDelete when the viewer owns the recipe", async () => {
        const onDelete = jest.fn();

        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={{ ...BASE_RECIPE, isOwner: true }}
                onDelete={onDelete}
            />,
        );

        expect(
            screen.getByRole("link", { name: /Edit recipe/ }),
        ).toHaveAttribute("href", "/change-recipe/1");
        expect(screen.queryByRole("radiogroup")).not.toBeInTheDocument();

        await userEvent.click(
            screen.getByRole("button", { name: /Delete recipe/ }),
        );

        expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it("should favourite the recipe on the server when the heart is pressed", async () => {
        mockedPut.mockResolvedValue({ data: null });

        renderWithRouter(<RecipeHero {...baseProps} />);

        await userEvent.click(
            screen.getAllByRole("button", { name: "Favourite" })[0],
        );

        expect(mockedPut).toHaveBeenCalledWith(
            API_ROUTES.recipes.favourite(1),
            undefined,
        );
        expect(
            screen.getAllByRole("button", { name: "Favourite" })[0],
        ).toHaveAttribute("aria-pressed", "true");
    });

    it("should show the signed-in actions, not the guest CTA, while the client session check is still pending", () => {
        renderWithRouter(<RecipeHero {...baseProps} onLogIntake={jest.fn()} />);

        expect(
            screen.queryByRole("link", { name: GUEST_CTA }),
        ).not.toBeInTheDocument();
        expect(
            screen.getAllByRole("button", { name: "Favourite" }),
        ).toHaveLength(2);
    });

    it("should show the log-intake button and call onLogIntake when calories are available", async () => {
        const onLogIntake = jest.fn();

        renderWithRouter(
            <RecipeHero {...baseProps} onLogIntake={onLogIntake} />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });

    it("should not show the log-intake button when onLogIntake is not provided", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_BUTTON }),
        ).not.toBeInTheDocument();
    });

    it("should hide both favourite buttons for a guest", () => {
        renderWithRouter(<RecipeHero {...baseProps} recipe={GUEST_RECIPE} />);

        expect(
            screen.queryByRole("button", { name: "Favourite" }),
        ).not.toBeInTheDocument();
    });

    it("should show a generic login CTA instead of the log-intake button for a guest", () => {
        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={GUEST_RECIPE}
                onLogIntake={jest.fn()}
            />,
        );

        expect(
            screen.queryByRole("button", { name: LOG_INTAKE_BUTTON }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole("link", { name: GUEST_CTA })).toHaveAttribute(
            "href",
            "/login",
        );
    });

    it("should show the generic login CTA for a guest even without onLogIntake", () => {
        renderWithRouter(<RecipeHero {...baseProps} recipe={GUEST_RECIPE} />);

        expect(screen.getByRole("link", { name: GUEST_CTA })).toHaveAttribute(
            "href",
            "/login",
        );
    });

    it("should show the log-intake button in the owner actions row and call onLogIntake", async () => {
        const onLogIntake = jest.fn();

        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={{ ...BASE_RECIPE, isOwner: true }}
                onLogIntake={onLogIntake}
            />,
        );

        await userEvent.click(
            screen.getByRole("button", { name: LOG_INTAKE_BUTTON }),
        );

        expect(onLogIntake).toHaveBeenCalledTimes(1);
    });

    it("should show the recipe photo named after the recipe", () => {
        renderWithRouter(
            <RecipeHero
                {...baseProps}
                recipe={{
                    ...BASE_RECIPE,
                    photo_key: "0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b",
                }}
            />,
        );

        expect(screen.getByAltText(RECIPE_TITLE)).toHaveAttribute(
            "src",
            mediaUrl("0b8f5a3e-2c4d-4e6f-8a1b-3c5d7e9f1a2b", "hero"),
        );
    });

    it("should credit the author by first name and surname initial", () => {
        renderWithRouter(<RecipeHero {...baseProps} />);

        expect(screen.getByText("by Test U.")).toBeInTheDocument();
    });
});
