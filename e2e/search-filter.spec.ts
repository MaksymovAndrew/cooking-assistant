import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import {
    createMenuViaForm,
    createRecipeViaForm,
    selectFromPicker,
} from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// exercises the recipe/menu search, type/category filter, and sort controls - none of it was visited by the other e2e specs, which only create+read+edit+delete
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
    // reuses the shared primary account (registered once in global-setup) instead of registering a fresh one here - keeps the suite's total auth calls low
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();

    ({ typeText: recipeAType } = await createRecipeViaForm(page, {
        title: recipeATitle,
        description: DESCRIPTION,
        ingredient: "Tomato",
        cookingHours: "0",
        cookingMinutes: "5",
        typeIndex: 1,
    }));
    ({ typeText: recipeBType } = await createRecipeViaForm(page, {
        title: recipeBTitle,
        description: DESCRIPTION,
        ingredient: "Onion",
        cookingHours: "1",
        cookingMinutes: "0",
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

    // the search box stays a text field/URL param, but it must resolve to ingredient_ids before hitting the API
    const [request] = await Promise.all([
        page.waitForRequest((req) =>
            req.url().includes("/api/recipes-filters-person"),
        ),
        page.getByPlaceholder("Search by ingredient").press("Enter"),
    ]);

    expect(request.url()).toContain("ingredient_ids=");
    expect(request.url()).not.toContain("ingredient_name=");

    await expect(page.getByText(recipeATitle)).toBeVisible();
    await expect(page.getByText(recipeBTitle)).toBeHidden();

    await page.getByRole("button", { name: "Reset Search" }).click();
    await expect(page.getByText(recipeBTitle)).toBeVisible();
});

test("should filter My Recipes by recipe type", async () => {
    await page.goto("/my-recipes");
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    await page.getByLabel(recipeAType).check();

    await expect(page.getByText(recipeATitle)).toBeVisible();
    await expect(page.getByText(recipeBTitle)).toBeHidden();

    // the panel stays open after Reset filters (only Apply/close/outside-click close it)
    await page.getByRole("button", { name: "Reset filters" }).click();
    await page.getByLabel(recipeBType).check();

    await expect(page.getByText(recipeBTitle)).toBeVisible();
    await expect(page.getByText(recipeATitle)).toBeHidden();

    await page.getByRole("button", { name: "Reset filters" }).click();
});

test("should sort My Recipes by cooking time", async () => {
    await page.goto("/my-recipes");
    await page.getByRole("button", { name: "Filters", exact: true }).click();

    // switch to "Long → fast" first so the click actually changes state, then back; polling the DOM (not a specific network response) is the robust check since the exact request shape can vary
    await page.getByRole("radio", { name: "Long → fast" }).click();

    await expect(async () => {
        const titles = await page
            .getByRole("heading", { level: 3 })
            .allTextContents();

        expect(titles.indexOf(recipeBTitle)).toBeLessThan(
            titles.indexOf(recipeATitle),
        );
    }).toPass();

    await page.getByRole("radio", { name: "Fast → long" }).click();

    await expect(async () => {
        const titles = await page
            .getByRole("heading", { level: 3 })
            .allTextContents();

        expect(titles.indexOf(recipeATitle)).toBeLessThan(
            titles.indexOf(recipeBTitle),
        );
    }).toPass();
});

test("should filter My Menus by title", async () => {
    await page.goto("/my-menus");
    await page.getByPlaceholder("Search by menu title").fill(menuXTitle);
    await page.getByPlaceholder("Search by menu title").press("Enter");

    await expect(page.getByRole("heading", { name: menuXTitle })).toBeVisible();
    await expect(page.getByText(menuYTitle)).toBeHidden();

    await page.getByRole("button", { name: "Reset Search" }).click();
    await expect(page.getByText(menuYTitle)).toBeVisible();
});

test("should filter My Menus by category", async () => {
    await page.goto("/my-menus");
    // the list page's category filter is a checkbox dropdown, not a <select> - reuse the category text captured from the create-menu form instead
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    await page.getByLabel(menuXCategory).check();

    await expect(page.getByText(menuXTitle)).toBeVisible();
    await expect(page.getByText(menuYTitle)).toBeHidden();
});

test("should filter My Recipes to only what's in the pantry", async () => {
    // recipe A needs Tomato, recipe B needs Onion - stocking only Tomato should isolate A
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await selectFromPicker(
        page,
        page.getByPlaceholder("Search ingredients..."),
        "Tomato",
    );
    await page.getByRole("button", { name: "Add to pantry" }).click();
    await expect(page.getByText("Ingredients saved")).toBeVisible();

    await page.goto("/my-recipes");
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    await page.getByRole("switch", { name: "Only what I can make" }).click();
    await page.getByRole("button", { name: /^Show \d+ recipes?$/ }).click();

    await expect(page.getByText(recipeATitle)).toBeVisible();
    await expect(page.getByText(recipeBTitle)).toBeHidden();

    // cleanup: leave the shared account's pantry empty for other specs (the goto below already resets the plain-Redux pantry filter state)
    await page.goto("/ingredients");
    await page
        .getByRole("heading", { name: "Tomato", level: 3 })
        .locator("../..")
        .getByRole("button", { name: "Delete" })
        .click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText("Ingredient deleted")).toBeVisible();
});
