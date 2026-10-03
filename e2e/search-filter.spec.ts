import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { deleteRecipe, removeFromPantry } from "./api";
import { createRecipeViaForm, selectFromPicker } from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// a few filters driven from the page; every filter's SQL is pinned in the db-integration suite
test.describe.configure({ mode: "serial" });

const DESCRIPTION = "Created by search-filter e2e.";

let context: BrowserContext;
let page: Page;
let recipeATitle: string;
let recipeBTitle: string;
const recipeIds: string[] = [];

test.beforeAll(async ({ browser }) => {
    const runId = Date.now().toString(36);

    recipeATitle = `Search filter recipe A ${runId}`;
    recipeBTitle = `Search filter recipe B ${runId}`;
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();

    const recipeA = await createRecipeViaForm(page, {
        title: recipeATitle,
        description: DESCRIPTION,
        ingredient: "Tomato",
        cookingHours: "0",
        cookingMinutes: "5",
    });

    recipeIds.push(recipeA.recipeId);

    const recipeB = await createRecipeViaForm(page, {
        title: recipeBTitle,
        description: DESCRIPTION,
        ingredient: "Onion",
        cookingHours: "1",
        cookingMinutes: "0",
    });

    recipeIds.push(recipeB.recipeId);
});

test.afterAll(async () => {
    try {
        for (const recipeId of recipeIds) {
            await deleteRecipe(context.request, recipeId);
        }

        await removeFromPantry(context.request, "tomato");
    } finally {
        await context.close();
    }
});

test("should filter My Recipes by recipe title", async () => {
    await page.goto("/my-recipes");
    // live search: debounced, no Enter needed
    await page.getByPlaceholder("Search by recipe title").fill(recipeATitle);

    // the search chip echoes the query, so plain getByText matches twice - scope to the card heading
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
    await page.getByPlaceholder("Search ingredients…").fill("Tomato");
    await page.getByRole("button", { name: "Tomato", exact: true }).click();

    await expect(page.getByText(recipeATitle)).toBeVisible();
    await expect(page.getByText(recipeBTitle)).toBeHidden();

    await page.getByRole("button", { name: "Reset filters" }).click();
});

test("should filter My Recipes to only what's in the pantry", async () => {
    // recipe A needs Tomato, recipe B needs Onion - stocking only Tomato should isolate A
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await selectFromPicker(
        page,
        page.getByPlaceholder("Search ingredients…"),
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
});
