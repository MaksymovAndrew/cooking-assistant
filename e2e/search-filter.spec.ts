import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { createMenuViaForm, createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// exercises the recipe/menu search, type/category filter, and sort controls -
// none of it was visited by the other e2e specs, which only create+read+edit+delete
test.describe.configure({ mode: "serial" });

const DESCRIPTION = "Created by search-filter e2e.";

let context: BrowserContext;
let page: Page;
let runId: string;
let recipeATitle: string;
let recipeBTitle: string;
let recipeAType: string;
let recipeBType: string;
let menuXTitle: string;
let menuYTitle: string;
let menuXCategory: string;

test.beforeAll(async ({ browser }) => {
    runId = Date.now().toString(36);
    recipeATitle = `Search filter recipe A ${runId}`;
    recipeBTitle = `Search filter recipe B ${runId}`;
    menuXTitle = `Search filter menu X ${runId}`;
    menuYTitle = `Search filter menu Y ${runId}`;
    // reuses the shared primary account (registered once in global-setup) instead of
    // registering a fresh one here - keeps the suite's total auth calls low
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();

    ({ typeText: recipeAType } = await createRecipeViaForm(page, {
        title: recipeATitle,
        description: DESCRIPTION,
        ingredient: "Tomato",
        cookingTime: "0:05",
        servings: "1 serving",
        typeIndex: 1,
    }));
    ({ typeText: recipeBType } = await createRecipeViaForm(page, {
        title: recipeBTitle,
        description: DESCRIPTION,
        ingredient: "Onion",
        cookingTime: "1:00",
        servings: "1 serving",
        typeIndex: 2,
    }));
    ({ categoryText: menuXCategory } = await createMenuViaForm(page, {
        title: menuXTitle,
        description: DESCRIPTION,
        recipeTitle: recipeATitle,
        categoryIndex: 1,
    }));
    await createMenuViaForm(page, {
        title: menuYTitle,
        description: DESCRIPTION,
        recipeTitle: recipeBTitle,
        categoryIndex: 2,
    });
});

test.afterAll(async () => {
    await context.close();
});

test("should filter My Recipes by ingredient name", async () => {
    await page.goto("/my-recipes");
    await page.getByPlaceholder("Search by ingredient").fill("Tomato");
    await page.getByPlaceholder("Search by ingredient").press("Enter");

    await expect(page.getByText(recipeATitle)).toBeVisible();
    await expect(page.getByText(recipeBTitle)).toBeHidden();

    await page.getByRole("button", { name: "Reset Search" }).click();
    await expect(page.getByText(recipeBTitle)).toBeVisible();
});

test("should filter My Recipes by recipe type", async () => {
    await page.goto("/my-recipes");
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.getByLabel(recipeAType).check();

    await expect(page.getByText(recipeATitle)).toBeVisible();
    await expect(page.getByText(recipeBTitle)).toBeHidden();

    // the dropdown is still open from the earlier click (checking a box doesn't close it)
    await page.getByRole("button", { name: "Reset filters" }).click();
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.getByLabel(recipeBType).check();

    await expect(page.getByText(recipeBTitle)).toBeVisible();
    await expect(page.getByText(recipeATitle)).toBeHidden();

    await page.getByRole("button", { name: "Reset filters" }).click();
});

test("should sort My Recipes by cooking time", async () => {
    await page.goto("/my-recipes");

    await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/recipes-filters-person") &&
                res.url().includes("sort_order=asc"),
        ),
        page.getByLabel("Sort by time:").selectOption("asc"),
    ]);

    // the network response resolving doesn't guarantee React has re-rendered yet -
    // poll the DOM instead of reading it once right after the response
    await expect(async () => {
        const titles = await page
            .getByRole("heading", { level: 2 })
            .allTextContents();

        expect(titles.indexOf(recipeATitle)).toBeLessThan(
            titles.indexOf(recipeBTitle),
        );
    }).toPass();

    await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/recipes-filters-person") &&
                res.url().includes("sort_order=desc"),
        ),
        page.getByLabel("Sort by time:").selectOption("desc"),
    ]);

    await expect(async () => {
        const titles = await page
            .getByRole("heading", { level: 2 })
            .allTextContents();

        expect(titles.indexOf(recipeBTitle)).toBeLessThan(
            titles.indexOf(recipeATitle),
        );
    }).toPass();
});

test("should filter My Menus by title", async () => {
    await page.goto("/my-menus");
    await page.getByPlaceholder("Search by menu title").fill(menuXTitle);
    await page.getByPlaceholder("Search by menu title").press("Enter");

    await expect(page.getByText(menuXTitle)).toBeVisible();
    await expect(page.getByText(menuYTitle)).toBeHidden();

    await page.getByRole("button", { name: "Reset Search" }).click();
    await expect(page.getByText(menuYTitle)).toBeVisible();
});

test("should filter My Menus by category", async () => {
    await page.goto("/my-menus");
    // the list page's category filter is a checkbox dropdown, not a <select> -
    // reuse the category text captured from the create-menu form instead
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.getByLabel(menuXCategory).check();

    await expect(page.getByText(menuXTitle)).toBeVisible();
    await expect(page.getByText(menuYTitle)).toBeHidden();
});
