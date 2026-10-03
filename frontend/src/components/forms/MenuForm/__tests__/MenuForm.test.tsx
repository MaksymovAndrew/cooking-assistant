import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { MenuCategory } from "types/menu";

import type { useMenuForm } from "hooks/useMenuForm";

import { MenuForm } from "components/forms/MenuForm";

import { renderWithRouter } from "test/router";

type Form = ReturnType<typeof useMenuForm>;

const MENU_TITLE_LABEL = "Menu title *";

const makeForm = (): Form => ({
    menuTitle: "",
    language: "en",
    setLanguage: jest.fn(),
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
    removeRecipe: jest.fn(),
    reorderSelectedRecipes: jest.fn(),
    photo: {
        src: null,
        error: null,
        isDirty: false,
        choose: jest.fn(),
        remove: jest.fn(),
        reset: jest.fn(),
        commit: jest.fn(),
    },
    setInitialValues: jest.fn(),
    isDirty: false,
    isDirtyRef: { current: false },
    markClean: jest.fn(),
    attachForm: jest.fn(),
});

const CATEGORIES: MenuCategory[] = [
    { menu_category_id: 1, category_name: "Dinner" },
];

const renderForm = (form: Form, onSubmit: () => void = jest.fn()) =>
    renderWithRouter(
        <MenuForm
            form={form}
            categories={CATEGORIES}
            keyPrefix="createMenuPage"
            idPrefix="create-menu"
            submitLabel="Create menu"
            onSubmit={onSubmit}
        />,
    );

describe("MenuForm", () => {
    it("should show the recipes error when provided", () => {
        const form = makeForm();

        form.errors.recipesError = "Please select at least one recipe.";
        renderForm(form);

        expect(
            screen.getByText("Please select at least one recipe."),
        ).toBeInTheDocument();
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
