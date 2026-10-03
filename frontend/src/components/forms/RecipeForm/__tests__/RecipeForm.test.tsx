import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Ingredient } from "types/ingredient";
import type { RecipeTypeSummary } from "types/recipeType";

import type { useRecipeForm } from "hooks/useRecipeForm";

import { RecipeForm } from "components/forms/RecipeForm";

import { ROUTE_ALL_RECIPES } from "test/constants";
import { mockNavigate, renderWithRouter } from "test/router";

type Form = ReturnType<typeof useRecipeForm>;

const makeForm = (): Form => ({
    title: "",
    language: "en",
    setLanguage: jest.fn(),
    setTitle: jest.fn(),
    content: "",
    setContent: jest.fn(),
    cookingHours: "",
    setCookingHours: jest.fn(),
    cookingMinutes: "",
    setCookingMinutes: jest.fn(),
    selectedIngredients: [],
    selectedTypeId: null,
    setSelectedTypeId: jest.fn(),
    caloriesOverride: "",
    setCaloriesOverride: jest.fn(),
    photo: {
        src: null,
        error: null,
        isDirty: false,
        choose: jest.fn(),
        remove: jest.fn(),
        reset: jest.fn(),
        commit: jest.fn(),
    },
    titleError: null,
    descriptionError: null,
    ingredientsError: null,
    typeError: null,
    cookingTimeError: null,
    toggleIngredientSelection: jest.fn(),
    updateIngredientQuantity: jest.fn(),
    removeIngredient: jest.fn(),
    reorderIngredients: jest.fn(),
    validateCreate: jest.fn(),
    validateChange: jest.fn(),
    setInitialValues: jest.fn(),
    isDirty: false,
    isDirtyRef: { current: false },
    markClean: jest.fn(),
    attachForm: jest.fn(),
});

const TITLE_LABEL = "Title *";
const DISCARD_TITLE = "Discard changes?";
const TYPES: RecipeTypeSummary[] = [
    { id: 1, type_name: "Soup", description: "" },
];
const INGREDIENTS: Ingredient[] = [
    {
        id: 1,
        slug: "egg",
        name: "Egg",
        category: "eggs",
        unit_name: "piece",
        allergens: ["eggs"],
        days_to_expire: null,
        calories_per_unit: null,
    },
];

const renderForm = (form: Form, onSubmit: () => void = jest.fn()) =>
    renderWithRouter(
        <RecipeForm
            form={form}
            allIngredients={INGREDIENTS}
            allTypes={TYPES}
            keyPrefix="createRecipePage"
            idPrefix="create-recipe"
            submitLabel="Create recipe"
            onSubmit={onSubmit}
        />,
    );

describe("RecipeForm", () => {
    it("should call setCaloriesOverride when the calories field is edited", async () => {
        const form = makeForm();

        renderForm(form);

        await userEvent.type(
            screen.getByLabelText("Calories per portion"),
            "5",
        );

        expect(form.setCaloriesOverride).toHaveBeenCalledWith("5");
    });

    it("should show the auto-computed calorie hint once ingredients are selected", () => {
        const form = makeForm();

        form.selectedIngredients = [
            {
                id: 1,
                slug: "egg",
                name: "Egg",
                quantity: 2,
                unit_name: "piece",
                calories_per_unit: 70,
            },
        ];
        renderForm(form);

        expect(
            screen.getByText(
                "Leave empty to use the calculated total: 140 kcal",
            ),
        ).toBeInTheDocument();
    });

    it("should show the ingredients error inside the ingredients card", () => {
        const form = makeForm();

        form.ingredientsError = "Add at least one ingredient.";
        renderForm(form);

        expect(
            screen.getByText("Add at least one ingredient."),
        ).toBeInTheDocument();
    });

    it("should show a discard-changes confirmation when cancelling a dirty form", async () => {
        const form = makeForm();

        form.isDirtyRef.current = true;
        renderForm(form);

        await userEvent.click(screen.getByText("Cancel"));

        expect(screen.getByText(DISCARD_TITLE)).toBeInTheDocument();
    });

    it("should stay on the form when the discard confirmation is cancelled", async () => {
        const form = makeForm();

        form.isDirtyRef.current = true;
        renderForm(form);

        await userEvent.click(screen.getByText("Cancel"));
        await userEvent.click(
            screen.getByRole("button", { name: "Keep editing" }),
        );

        expect(screen.queryByText(DISCARD_TITLE)).not.toBeInTheDocument();
        expect(screen.getByText(TITLE_LABEL)).toBeInTheDocument();
    });

    it("should navigate away without confirmation when the form is not dirty", async () => {
        renderForm(makeForm());

        await userEvent.click(screen.getByText("Cancel"));

        expect(mockNavigate).toHaveBeenCalledWith(ROUTE_ALL_RECIPES);
        expect(screen.queryByText(DISCARD_TITLE)).not.toBeInTheDocument();
    });
});
