import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Ingredient } from "types/ingredient";
import type { RecipeTypeSummary } from "types/recipeType";

import type { useRecipeForm } from "hooks/useRecipeForm";

import { RecipeForm } from "components/forms/RecipeForm";

import { renderWithRouter } from "test/router";

type Form = ReturnType<typeof useRecipeForm>;

const makeForm = (): Form => ({
    title: "",
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
    it("should render every labelled field and the submit button", () => {
        renderForm(makeForm());

        expect(screen.getByText(TITLE_LABEL)).toBeInTheDocument();
        expect(screen.getByText("Description *")).toBeInTheDocument();
        expect(screen.getByText("Cooking time *")).toBeInTheDocument();
        expect(screen.getByText("Recipe type *")).toBeInTheDocument();
        expect(screen.getAllByText("Ingredients").length).toBeGreaterThan(0);
        expect(
            screen.getByRole("button", { name: "Create recipe" }),
        ).toBeInTheDocument();
    });

    it("should bind the title input to the form value", () => {
        const form = makeForm();

        form.title = "Borscht";
        renderForm(form);

        expect(screen.getByLabelText(TITLE_LABEL)).toHaveValue("Borscht");
    });

    it("should call setTitle when the title field is edited", async () => {
        const form = makeForm();

        renderForm(form);

        await userEvent.type(screen.getByLabelText(TITLE_LABEL), "S");

        expect(form.setTitle).toHaveBeenCalledWith("S");
    });

    it("should call setContent when the description field is edited", async () => {
        const form = makeForm();

        renderForm(form);

        await userEvent.type(screen.getByLabelText("Description *"), "B");

        expect(form.setContent).toHaveBeenCalledWith("B");
    });

    it("should search and toggle an ingredient on click", async () => {
        const form = makeForm();

        renderForm(form);

        await userEvent.type(
            screen.getByPlaceholderText("Search ingredients..."),
            "egg",
        );
        await userEvent.click(screen.getByRole("button", { name: /egg/i }));

        expect(form.toggleIngredientSelection).toHaveBeenCalledWith(
            INGREDIENTS[0],
        );
    });

    it("should show the title error under the title field", () => {
        const form = makeForm();

        form.titleError = "Recipe title cannot be empty.";
        renderForm(form);

        expect(
            screen.getByText("Recipe title cannot be empty."),
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

    it("should call onSubmit when the submit button is clicked", async () => {
        const onSubmit = jest.fn();

        renderForm(makeForm(), onSubmit);

        await userEvent.click(
            screen.getByRole("button", { name: "Create recipe" }),
        );

        expect(onSubmit).toHaveBeenCalledTimes(1);
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

        expect(screen.queryByText(DISCARD_TITLE)).not.toBeInTheDocument();
    });
});
