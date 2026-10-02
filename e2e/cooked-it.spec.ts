import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import {
    createMenuViaForm,
    createRecipeViaForm,
    selectFromPicker,
} from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// "Cooked it" against a real pantry: the recipe's ingredient leaves the pantry, the toast's undo puts it
// back, and cooking from a menu updates the server-rendered missing-ingredients panel without a reload
test.describe.configure({ mode: "serial" });

const COOKED_IT = "Cooked it";

let context: BrowserContext;
let page: Page;
let runId: string;
let recipeId: string;
let menuId: string;

const stockGarlic = async () => {
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await selectFromPicker(
        page,
        page.getByPlaceholder("Search ingredients…"),
        "Garlic",
    );
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Add to pantry" }).click();
    await expect(page.getByText("Ingredients saved")).toBeVisible();
};

const garlicInPantry = () =>
    page.getByRole("heading", { name: "Garlic", level: 3 });

const cookFromModal = async () => {
    await page.getByRole("button", { name: COOKED_IT }).click();

    const dialog = page.getByRole("dialog");

    await expect(dialog.getByText("Garlic")).toBeVisible();
    await dialog.getByRole("button", { name: COOKED_IT }).click();
    await expect(
        page.getByText("Cooked! 1 product taken from your pantry"),
    ).toBeVisible();
};

test.beforeAll(async ({ browser }) => {
    runId = Date.now().toString(36);
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();

    const recipe = await createRecipeViaForm(page, {
        title: `Cooked it recipe ${runId}`,
        description: "Needs one clove of Garlic.",
        ingredient: "Garlic",
        cookingHours: "0",
        cookingMinutes: "10",
    });

    recipeId = recipe.recipeId;

    const menu = await createMenuViaForm(page, {
        title: `Cooked it menu ${runId}`,
        description: "Created by cooked-it e2e.",
        recipeTitle: `Cooked it recipe ${runId}`,
    });

    menuId = menu.menuId;
    await stockGarlic();
});

test.afterAll(async () => {
    // cleanup: leave the shared account's pantry, menus and recipes clean for other specs
    await page.goto("/ingredients");

    if (await garlicInPantry().isVisible()) {
        await garlicInPantry()
            .locator("../..")
            .getByRole("button", { name: "Delete" })
            .click();
        await page
            .getByRole("dialog")
            .getByRole("button", { name: "Delete" })
            .click();
        await expect(page.getByText("Ingredient deleted")).toBeVisible();
    }

    await page.goto(`/menu/${menuId}`);
    await page.getByRole("button", { name: "Delete menu" }).click();
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "Delete menu" })
        .click();
    await expect(page).toHaveURL(/\/all-menus$/);

    await page.goto(`/recipe/${recipeId}`);
    await page.getByRole("button", { name: "Delete recipe" }).click();
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "Delete recipe" })
        .click();
    await expect(page).toHaveURL(/\/all-recipes$/);

    await context.close();
});

test("should take the recipe's ingredient out of the pantry and put it back on undo", async () => {
    await page.goto(`/recipe/${recipeId}`);
    await cookFromModal();

    await page
        .getByRole("status")
        .getByRole("button", { name: "Undo" })
        .click();
    await expect(
        page.getByText("Undone - everything is back in your pantry"),
    ).toBeVisible();

    await page.goto("/ingredients");
    await expect(garlicInPantry()).toBeVisible();
});

test("should update the menu's missing ingredients without a reload once cooked", async () => {
    await page.goto(`/menu/${menuId}`);

    const panel = page.getByRole("complementary");

    await expect(panel.locator('[aria-label="You have enough"]')).toBeVisible();

    await cookFromModal();

    await expect(panel.locator('[aria-label="You have enough"]')).toBeHidden();
    await expect(panel.getByText("Garlic")).toBeVisible();
});

test("should mark an ingredient the pantry no longer has as skipped", async () => {
    await page.goto(`/recipe/${recipeId}`);
    await page.getByRole("button", { name: COOKED_IT }).click();

    const dialog = page.getByRole("dialog");

    await expect(
        dialog.getByText("Not in your pantry - skipped"),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel" }).click();
    await expect(dialog).toBeHidden();
});
