import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { createMenuViaForm, createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// ids come from the create-response bodies, not card/list markup, so these
// survive the upcoming page redesign
test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let page: Page;
let runId: string;
let recipeId: string;
let menuId: string;

test.beforeAll(async ({ browser }) => {
    runId = Date.now().toString(36);
    // reuses the shared primary account (registered once in global-setup) instead of
    // registering a fresh one here - keeps the suite's total auth calls low
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();
});

test.afterAll(async () => {
    await context.close();
});

test("should create a recipe and capture its id from the API response", async () => {
    const created = await createRecipeViaForm(page, {
        title: `Original recipe title ${runId}`,
        description: "Created by core-flows e2e.",
        ingredient: "Potato",
        cookingTime: "0:20",
        servings: "a full pot",
    });

    recipeId = created.recipeId;
    expect(recipeId).toBeTruthy();
});

test("should edit the recipe and see the new title on its details page", async () => {
    await page.goto(`/change-recipe/${recipeId}`);
    const titleInput = page.getByLabel("Title");
    await titleInput.fill("");
    await titleInput.fill(`Updated recipe title ${runId}`);
    await page.getByRole("button", { name: "Update Recipe" }).click();
    await expect(page).toHaveURL(/\/all-recipes$/);

    await page.goto(`/recipe/${recipeId}`);
    await expect(
        page.getByRole("heading", { name: `Updated recipe title ${runId}` }),
    ).toBeVisible();
});

test("should create a menu from the recipe and capture its id", async () => {
    const created = await createMenuViaForm(page, {
        title: `Original menu title ${runId}`,
        description: "Created by core-flows e2e.",
        recipeTitle: `Updated recipe title ${runId}`,
    });

    menuId = created.menuId;
    expect(menuId).toBeTruthy();
});

test("should edit the menu and see the new title on its details page", async () => {
    await page.goto(`/change-menu/${menuId}`);
    const titleInput = page.getByLabel("Menu title");
    await titleInput.fill("");
    await titleInput.fill(`Updated menu title ${runId}`);
    await page.getByRole("button", { name: "Update Menu" }).click();
    await expect(page).toHaveURL(/\/all-menus$/);

    await page.goto(`/menu/${menuId}`);
    await expect(
        page.getByRole("heading", { name: `Updated menu title ${runId}` }),
    ).toBeVisible();
});

test("should delete the menu and redirect away from its details page", async () => {
    await page.goto(`/menu/${menuId}`);
    await page.getByRole("button", { name: "Delete menu" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page).toHaveURL(/\/all-menus$/);
});

test("should delete the recipe and redirect away from its details page", async () => {
    await page.goto(`/recipe/${recipeId}`);
    await page.getByRole("button", { name: "Delete recipe" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page).toHaveURL(/\/all-recipes$/);
});

test("should edit a pantry ingredient's quantity and persist it across reload", async () => {
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "Edit ingredients" }).click();
    await page.getByRole("button", { name: "Onion", exact: true }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Ingredients saved")).toBeVisible();

    await page.getByRole("button", { name: "Edit quantities" }).click();
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.fill("7");
    await page.getByRole("button", { name: "Save quantities" }).click();
    await expect(page.getByText("Quantities updated")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Onion")).toBeVisible();
});

test("should switch the theme via the confirm modal and persist it across reload", async () => {
    await page.goto("/");
    const htmlBefore = await page.locator("html").getAttribute("data-theme");

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await page.getByRole("button", { name: "Switch theme" }).click();
    await page.waitForLoadState("load");

    await expect(page.locator("html")).not.toHaveAttribute(
        "data-theme",
        htmlBefore ?? "",
    );
    const htmlAfter = await page.locator("html").getAttribute("data-theme");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        htmlAfter ?? "",
    );
});
