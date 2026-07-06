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
    cookingTime: "",
    setCookingTime: jest.fn(),
    servings: "",
    setServings: jest.fn(),
    selectedIngredients: [],
    selectedTypeId: null,
    setSelectedTypeId: jest.fn(),
    error: null,
    setError: jest.fn(),
    typeError: null,
    cookingTimeError: null,
    toggleIngredientSelection: jest.fn(),
    updateIngredientQuantity: jest.fn(),
    validateCreate: jest.fn(),
    validateChange: jest.fn(),
    setInitialValues: jest.fn(),
});

const TYPES: RecipeTypeSummary[] = [
    { id: 1, type_name: "Soup", description: "" },
];
const INGREDIENTS: Ingredient[] = [{ id: 1, name: "Egg", unit_name: "pcs" }];

const renderForm = (
    form: Form,
    opts: { error?: string | null; onSubmit?: () => void } = {},
) =>
    renderWithRouter(
        <RecipeForm
            form={form}
            allIngredients={INGREDIENTS}
            allTypes={TYPES}
            keyPrefix="createRecipePage"
            idPrefix="create-recipe"
            typeError={null}
            error={opts.error ?? null}
            submitLabel="Create Recipe"
            onSubmit={opts.onSubmit ?? jest.fn()}
        />,
    );

describe("RecipeForm", () => {
    it("should render every labelled field and the submit button", () => {
        renderForm(makeForm());

        expect(screen.getByText("Title")).toBeInTheDocument();
        expect(screen.getByText("Description")).toBeInTheDocument();
        expect(screen.getByText("Cooking Time (hh:mm)")).toBeInTheDocument();
        expect(screen.getByText("Recipe Type")).toBeInTheDocument();
        expect(screen.getByText("Ingredients")).toBeInTheDocument();
        expect(screen.getByText(/Servings/)).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Create Recipe" }),
        ).toBeInTheDocument();
    });

    it("should bind the title input to the form value", () => {
        const form = makeForm();

        form.title = "Borscht";
        renderForm(form);

        expect(screen.getByLabelText("Title")).toHaveValue("Borscht");
    });

    it("should call setTitle when the title field is edited", async () => {
        const form = makeForm();

        renderForm(form);

        await userEvent.type(screen.getByLabelText("Title"), "S");

        expect(form.setTitle).toHaveBeenCalledWith("S");
    });

    it("should call setContent when the description field is edited", async () => {
        const form = makeForm();

        renderForm(form);

        await userEvent.type(screen.getByLabelText("Description"), "B");

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

    it("should show the form-level error when provided", () => {
        renderForm(makeForm(), { error: "Something failed" });

        expect(screen.getByText("Something failed")).toBeInTheDocument();
    });

    it("should call onSubmit when the submit button is clicked", async () => {
        const onSubmit = jest.fn();

        renderForm(makeForm(), { onSubmit });

        await userEvent.click(
            screen.getByRole("button", { name: "Create Recipe" }),
        );

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });
});
