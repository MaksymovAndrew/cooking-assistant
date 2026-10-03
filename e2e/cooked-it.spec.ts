import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import {
    deleteMenu,
    deleteRecipe,
    removeFromPantry,
    removeFromShoppingList,
} from "./api";
import {
    createMenuViaForm,
    createRecipeViaForm,
    selectFromPicker,
} from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// one story against a real pantry: each test picks up where the previous one left it
test.describe.configure({ mode: "serial" });

const COOKED_IT = "Cooked it";
const HAVE_ENOUGH = "You have enough";

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

    ({ recipeId } = await createRecipeViaForm(page, {
        title: `Cooked it recipe ${runId}`,
        description: "Needs one clove of Garlic.",
        ingredient: "Garlic",
        cookingHours: "0",
        cookingMinutes: "10",
    }));
    ({ menuId } = await createMenuViaForm(page, {
        title: `Cooked it menu ${runId}`,
        description: "Created by cooked-it e2e.",
        recipeTitle: `Cooked it recipe ${runId}`,
    }));
});

test.afterAll(async () => {
    // cleanup: the shared account goes back as it was for the specs that follow
    try {
        await deleteMenu(context.request, menuId);
        await deleteRecipe(context.request, recipeId);
        await removeFromPantry(context.request, "garlic");
        await removeFromShoppingList(context.request, "garlic");
    } finally {
        await context.close();
    }
});

test("should list the recipe's ingredient as missing before it's in the pantry", async () => {
    await page.goto(`/menu/${menuId}`);

    const panel = page.getByRole("complementary");

    await expect(
        panel.getByRole("img", { name: "1 missing ingredient", exact: true }),
    ).toBeVisible();
    await expect(panel.getByText("Garlic")).toBeVisible();
    await expect(panel.getByText("1 clove")).toBeVisible();
    await expect(panel.getByLabel(HAVE_ENOUGH)).toBeHidden();
});

test("should send the missing ingredient to the shopping list and link to it", async () => {
    await page.goto(`/menu/${menuId}`);
    await page
        .getByRole("button", { name: "Add missing to shopping list" })
        .click();
    await expect(page.getByText("Added to your shopping list.")).toBeVisible();

    await page.getByRole("link", { name: "Open list" }).click();
    await expect(page).toHaveURL(/\/shopping-list$/);

    const toBuy = page.getByRole("region", { name: "To buy" });

    await expect(toBuy.getByText("Garlic")).toBeVisible();
    await expect(toBuy.getByText("1 clove")).toBeVisible();
});

test("should take the recipe's ingredient out of the pantry and put it back on undo", async () => {
    await stockGarlic();
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

    await expect(panel.getByLabel(HAVE_ENOUGH)).toBeVisible();

    await cookFromModal();

    await expect(panel.getByLabel(HAVE_ENOUGH)).toBeHidden();
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
