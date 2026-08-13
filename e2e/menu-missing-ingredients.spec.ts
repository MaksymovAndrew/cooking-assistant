import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import {
    createMenuViaForm,
    createRecipeViaForm,
    selectFromPicker,
} from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// the flagship "missing ingredients" panel on the menu details page (menu_recipe -> recipe_ingredients
// -> ingredients, minus the pantry) - proves the subtraction against a real Postgres pantry, not just
// that the panel renders
test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let page: Page;
let runId: string;
let recipeId: string;
let menuId: string;

test.beforeAll(async ({ browser }) => {
    runId = Date.now().toString(36);
    // reuses the shared primary account (registered once in global-setup) instead of registering a fresh one here - keeps the suite's total auth calls low
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();

    const recipe = await createRecipeViaForm(page, {
        title: `Missing ingredients recipe ${runId}`,
        description: "Needs one clove of Garlic.",
        ingredient: "Garlic",
        cookingHours: "0",
        cookingMinutes: "10",
    });

    recipeId = recipe.recipeId;

    const menu = await createMenuViaForm(page, {
        title: `Missing ingredients menu ${runId}`,
        description: "Created by menu-missing-ingredients e2e.",
        recipeTitle: `Missing ingredients recipe ${runId}`,
    });

    menuId = menu.menuId;
});

test.afterAll(async () => {
    // cleanup: leave the shared account's pantry, menus and recipes clean for other specs
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

test("should list the recipe's ingredient as missing before it's in the pantry", async () => {
    await page.goto(`/menu/${menuId}`);

    const panel = page.getByRole("complementary");

    await expect(panel.getByText("1", { exact: true })).toBeVisible(); // missing-count badge
    await expect(panel.getByText("Garlic")).toBeVisible();
    await expect(panel.getByText("1 clove")).toBeVisible();
    await expect(panel.locator('[aria-label="You have enough"]')).toBeHidden();
});

test("should mark the ingredient as sufficient once enough is stocked in the pantry", async () => {
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await selectFromPicker(
        page,
        page.getByPlaceholder("Search ingredients..."),
        "Garlic",
    );
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Add to pantry" }).click();
    await expect(page.getByText("Ingredients saved")).toBeVisible();

    await page.goto(`/menu/${menuId}`);

    const panel = page.getByRole("complementary");

    await expect(panel.locator('[aria-label="You have enough"]')).toBeVisible();
    await expect(panel.getByText("Garlic")).toBeVisible();

    // cleanup: leave the shared account's pantry empty for other specs (menu/recipe cleanup happens in afterAll)
    await page.goto("/ingredients");
    await page
        .getByRole("heading", { name: "Garlic", level: 3 })
        .locator("../..")
        .getByRole("button", { name: "Delete" })
        .click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText("Ingredient deleted")).toBeVisible();
});
