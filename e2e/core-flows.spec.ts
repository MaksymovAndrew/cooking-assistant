import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { deleteMenu, deleteRecipe } from "./api";
import { createMenuViaForm, createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let page: Page;
let runId: string;
let recipeId: string;
let menuId: string;

test.beforeAll(async ({ browser }) => {
    runId = Date.now().toString(36);
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();

    ({ recipeId } = await createRecipeViaForm(page, {
        title: `Original recipe title ${runId}`,
        description: "Created by core-flows e2e.",
        ingredient: "Potato",
        cookingHours: "0",
        cookingMinutes: "20",
    }));
    ({ menuId } = await createMenuViaForm(page, {
        title: `Original menu title ${runId}`,
        description: "Created by core-flows e2e.",
        recipeTitle: `Original recipe title ${runId}`,
    }));
});

test.afterAll(async () => {
    // cleanup: the delete tests may never have run, so leave the shared account clean either way
    try {
        await deleteMenu(context.request, menuId);
        await deleteRecipe(context.request, recipeId);
    } finally {
        await context.close();
    }
});

test("should edit the recipe and see the new title on its details page", async () => {
    await page.goto(`/change-recipe/${recipeId}`);
    const titleInput = page.getByLabel("Title");
    await titleInput.fill("");
    await titleInput.fill(`Updated recipe title ${runId}`);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/all-recipes$/);

    await page.goto(`/recipe/${recipeId}`);
    await expect(
        page.getByRole("heading", { name: `Updated recipe title ${runId}` }),
    ).toBeVisible();
});

test("should edit the menu and see the new title on its details page", async () => {
    await page.goto(`/change-menu/${menuId}`);
    const titleInput = page.getByLabel("Menu title");
    await titleInput.fill("");
    await titleInput.fill(`Updated menu title ${runId}`);
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL(/\/all-menus$/);

    await page.goto(`/menu/${menuId}`);
    await expect(
        page.getByRole("heading", { name: `Updated menu title ${runId}` }),
    ).toBeVisible();
});

test("should delete the menu and redirect away from its details page", async () => {
    await page.goto(`/menu/${menuId}`);
    await page.getByRole("button", { name: "Delete menu" }).click();
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "Delete menu" })
        .click();
    await expect(page).toHaveURL(/\/all-menus$/);
});

test("should delete the recipe and redirect away from its details page", async () => {
    await page.goto(`/recipe/${recipeId}`);
    await page.getByRole("button", { name: "Delete recipe" }).click();
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "Delete recipe" })
        .click();
    await expect(page).toHaveURL(/\/all-recipes$/);
});

test("should switch the theme via the confirm modal and persist it across reload", async () => {
    await page.goto("/");
    const htmlBefore = await page.locator("html").getAttribute("data-theme");

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await page.getByRole("button", { name: "Switch & reload" }).click();
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
