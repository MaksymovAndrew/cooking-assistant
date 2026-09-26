import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { createMenuViaForm, createRecipeViaForm } from "./forms";
import { VIEWER_STORAGE_STATE } from "./sharedAccounts";

// a recipe and a menu written in another language: the badge on cards and pages, the list filter, the edit form
test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let page: Page;
let recipeId: string;
let menuId: string;
let recipeTitle: string;
let menuTitle: string;

test.beforeAll(async ({ browser }) => {
    const stamp = Date.now().toString(36);

    recipeTitle = `Pierogi ${stamp}`;
    menuTitle = `Obiad ${stamp}`;
    context = await browser.newContext({ storageState: VIEWER_STORAGE_STATE });
    page = await context.newPage();

    ({ recipeId } = await createRecipeViaForm(page, {
        title: recipeTitle,
        description: "Created by content language e2e.",
        ingredient: "Milk",
        cookingHours: "0",
        cookingMinutes: "20",
        language: "pl",
    }));
    ({ menuId } = await createMenuViaForm(page, {
        title: menuTitle,
        description: "Created by content language e2e.",
        recipeTitle,
        language: "uk",
    }));
});

test.afterAll(async () => {
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

test("should mark the recipe's language on its card and its page", async () => {
    await page.goto(`/all-recipes?q=${encodeURIComponent(recipeTitle)}`);
    await expect(
        page.getByRole("article").getByTitle("In Polish"),
    ).toContainText("PL");

    await page.goto(`/recipe/${recipeId}`);
    await expect(page.getByTitle("In Polish")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveAttribute(
        "lang",
        "pl",
    );
});

test("should filter the recipe list by language", async () => {
    const search = `q=${encodeURIComponent(recipeTitle)}`;

    await page.goto(`/all-recipes?${search}&lang=pl`);
    await expect(page.getByRole("article")).toHaveCount(1);

    await page.goto(`/all-recipes?${search}&lang=en,uk`);
    await expect(page.getByRole("article")).toHaveCount(0);
});

test("should keep the chosen language in the edit form", async () => {
    await page.goto(`/change-recipe/${recipeId}`);

    await expect(page.getByLabel("Recipe language")).toHaveValue("pl");
});

test("should mark and filter a menu by its language", async () => {
    const search = `q=${encodeURIComponent(menuTitle)}`;

    await page.goto(`/all-menus?${search}&lang=uk`);
    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(
        page.getByRole("article").getByTitle("In Ukrainian"),
    ).toContainText("UA");

    await page.goto(`/all-menus?${search}&lang=pl`);
    await expect(page.getByRole("article")).toHaveCount(0);
});
