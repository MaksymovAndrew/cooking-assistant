import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuCategory } from "types/menu";
import type { RecipeListItem } from "types/recipe";

import type { useMenuForm } from "hooks/useMenuForm";

import { MenuForm } from "components/forms/MenuForm";

import { renderWithRouter } from "test/router";

type Form = ReturnType<typeof useMenuForm>;

const MENU_TITLE_LABEL = "Menu title *";

const makeForm = (): Form => ({
    menuTitle: "",
    menuDescription: "",
    selectedCategory: null,
    selectedRecipes: [],
    errors: {
        menuTitleError: null,
        menuDescriptionError: null,
        categoryError: null,
        recipesError: null,
    },
    setMenuTitle: jest.fn(),
    setMenuDescription: jest.fn(),
    setSelectedCategory: jest.fn(),
    validateForm: jest.fn(),
    toggleRecipeSelection: jest.fn(),
    reorderSelectedRecipes: jest.fn(),
    setInitialValues: jest.fn(),
    isDirty: false,
    isDirtyRef: { current: false },
    markClean: jest.fn(),
});

const CATEGORIES: MenuCategory[] = [
    { menu_category_id: 1, category_name: "Dinner" },
];
const RECIPES: RecipeListItem[] = [
    {
        id: 1,
        title: "Borscht",
        type_name: "Soup",
        creation_date: "2024-01-01",
        cooking_time: 60,
    },
];

const renderForm = (form: Form, onSubmit: () => void = jest.fn()) =>
    renderWithRouter(
        <MenuForm
            form={form}
            categories={CATEGORIES}
            allRecipes={RECIPES}
            keyPrefix="createMenuPage"
            idPrefix="create-menu"
            submitLabel="Create menu"
            onSubmit={onSubmit}
        />,
    );

describe("MenuForm", () => {
    it("should render every labelled field and the submit button", () => {
        renderForm(makeForm());

        expect(screen.getByText(MENU_TITLE_LABEL)).toBeInTheDocument();
        expect(screen.getByText("Menu description *")).toBeInTheDocument();
        expect(screen.getByText("Menu category *")).toBeInTheDocument();
        expect(screen.getAllByText("Recipes").length).toBeGreaterThan(0);
        expect(
            screen.getByRole("button", { name: "Create menu" }),
        ).toBeInTheDocument();
    });

    it("should bind the title input to the form value", () => {
        const form = makeForm();

        form.menuTitle = "Sunday dinners";
        renderForm(form);

        expect(screen.getByLabelText(MENU_TITLE_LABEL)).toHaveValue(
            "Sunday dinners",
        );
    });

    it("should call setMenuTitle when the title field is edited", async () => {
        const form = makeForm();

        renderForm(form);

        await userEvent.type(screen.getByLabelText(MENU_TITLE_LABEL), "S");

        expect(form.setMenuTitle).toHaveBeenCalledWith("S");
    });

    it("should search and select a recipe", async () => {
        const DEBOUNCE_MS = 300;

        jest.useFakeTimers();
        const user = userEvent.setup({
            advanceTimers: (ms) => {
                jest.advanceTimersByTime(ms);
            },
        });

        try {
            const form = makeForm();

            renderForm(form);

            await user.type(
                screen.getByPlaceholderText("Search recipes..."),
                "borscht",
            );
            act(() => {
                jest.advanceTimersByTime(DEBOUNCE_MS);
            });
            await user.click(screen.getByRole("button", { name: /borscht/i }));

            expect(form.toggleRecipeSelection).toHaveBeenCalledWith(1);
        } finally {
            jest.useRealTimers();
        }
    });

    it("should show selected recipes as removable rows", async () => {
        const form = makeForm();

        form.selectedRecipes = [1];
        renderForm(form);

        await userEvent.click(screen.getByRole("button", { name: "Remove" }));

        expect(form.toggleRecipeSelection).toHaveBeenCalledWith(1);
    });

    it("should show the recipes error when provided", () => {
        const form = makeForm();

        form.errors.recipesError = "Please select at least one recipe.";
        renderForm(form);

        expect(
            screen.getByText("Please select at least one recipe."),
        ).toBeInTheDocument();
    });

    it("should call onSubmit when the submit button is clicked", async () => {
        const onSubmit = jest.fn();

        renderForm(makeForm(), onSubmit);

        await userEvent.click(
            screen.getByRole("button", { name: "Create menu" }),
        );

        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it("should show a discard-changes confirmation when cancelling a dirty form", async () => {
        const form = makeForm();

        form.isDirtyRef.current = true;
        renderForm(form);

        await userEvent.click(screen.getByText("Cancel"));

        expect(screen.getByText("Discard changes?")).toBeInTheDocument();
    });

    it("should stay on the form when the discard confirmation is cancelled", async () => {
        const form = makeForm();

        form.isDirtyRef.current = true;
        renderForm(form);

        await userEvent.click(screen.getByText("Cancel"));
        await userEvent.click(
            screen.getByRole("button", { name: "Keep editing" }),
        );

        expect(screen.queryByText("Discard changes?")).not.toBeInTheDocument();
        expect(screen.getByText(MENU_TITLE_LABEL)).toBeInTheDocument();
    });
});
