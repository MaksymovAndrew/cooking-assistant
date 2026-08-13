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

test("should filter My Recipes by recipe title", async () => {
    await page.goto("/my-recipes");

    // search is live now (debounced, no Enter needed); it matches the recipe's own
    // title - ingredient filtering moved to the picker inside the Filters popover
    const requestPromise = page.waitForRequest(
        (req) =>
            req.url().includes("/api/recipes-filters-person") &&
            req.url().includes("recipe_name="),
    );

    await page.getByPlaceholder("Search by recipe title").fill(recipeATitle);

    const request = await requestPromise;

    expect(request.url()).not.toContain("ingredient_ids=");

    // the search chip echoes the query text, which collides with a plain getByText
    // lookup once the query is the recipe's own full title - scope to the card heading
    await expect(
        page.getByRole("heading", { name: recipeATitle }),
    ).toBeVisible();
    await expect(page.getByText(recipeBTitle)).toBeHidden();

    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await expect(page.getByText(recipeBTitle)).toBeVisible();
});

test("should filter My Recipes by ingredient via the filter popover picker", async () => {
    await page.goto("/my-recipes");
    await page.getByRole("button", { name: "Filters", exact: true }).click();

    const requestPromise = page.waitForRequest(
        (req) =>
            req.url().includes("/api/recipes-filters-person") &&
            req.url().includes("ingredient_ids="),
    );

    await page.getByPlaceholder("Search ingredients...").fill("Tomato");
    await page.getByRole("button", { name: "Tomato", exact: true }).click();

    const request = await requestPromise;

    expect(request.url()).not.toContain("recipe_name=");

    await expect(page.getByText(recipeATitle)).toBeVisible();
    await expect(page.getByText(recipeBTitle)).toBeHidden();

    await page.getByRole("button", { name: "Reset filters" }).click();
});

test("should filter My Recipes by recipe type", async () => {
    await page.goto("/my-recipes");
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    // a plain click + web-first assertion (not .check()) - the checkbox's
    // aria-checked comes from URL-driven app state after a client-side
    // navigation, not a native input, so it needs the assertion's own retry
    // rather than .check()'s single click-then-verify
    await page.getByLabel(recipeAType).click();
    await expect(page.getByLabel(recipeAType)).toHaveAttribute(
        "aria-checked",
        "true",
    );

    await expect(page.getByText(recipeATitle)).toBeVisible();
    await expect(page.getByText(recipeBTitle)).toBeHidden();

    // the panel stays open after Reset filters (only Apply/close/outside-click close it)
    await page.getByRole("button", { name: "Reset filters" }).click();
    await page.getByLabel(recipeBType).click();
    await expect(page.getByLabel(recipeBType)).toHaveAttribute(
        "aria-checked",
        "true",
    );

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
    // live search is debounced, no Enter needed - the web-first assertion below already retries until the debounce settles
    await page.getByPlaceholder("Search by menu title").fill(menuXTitle);

    await expect(page.getByRole("heading", { name: menuXTitle })).toBeVisible();
    await expect(page.getByText(menuYTitle)).toBeHidden();

    await page.getByRole("button", { name: "Clear", exact: true }).click();
    await expect(page.getByText(menuYTitle)).toBeVisible();
});

test("should filter My Menus by category", async () => {
    await page.goto("/my-menus");
    // the list page's category filter is a chip group, not a <select> - reuse the category text captured from the create-menu form instead
    await page.getByRole("button", { name: "Filter", exact: true }).click();
    // click + web-first assertion, not .check() - same reason as the recipe type filter above
    await page.getByLabel(menuXCategory).click();
    await expect(page.getByLabel(menuXCategory)).toHaveAttribute(
        "aria-checked",
        "true",
    );

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
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Add to pantry" }).click();
    await expect(page.getByText("Ingredients saved")).toBeVisible();

    await page.goto("/my-recipes");
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    await page.getByRole("switch", { name: "Only what I can make" }).click();
    await page.getByRole("button", { name: /^Show \d+ recipes?$/ }).click();

    await expect(page.getByText(recipeATitle)).toBeVisible();
    await expect(page.getByText(recipeBTitle)).toBeHidden();

    // cleanup: leave the shared account's pantry empty for other specs (the goto below already drops the pantry filter, since it's URL-scoped to /my-recipes)
    await page.goto("/ingredients");
    await page
        .getByRole("heading", { name: "Tomato", level: 3 })
        .locator("../..")
        .getByRole("button", { name: "Delete" })
        .click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText("Ingredient deleted")).toBeVisible();
});
