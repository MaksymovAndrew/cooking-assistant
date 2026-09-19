import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { createRecipeViaForm } from "./forms";
import { VIEWER_STORAGE_STATE } from "./sharedAccounts";

// private tags: created on a recipe page, kept after a reload, usable as a recipe filter
test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let page: Page;
let recipeId: string;
let recipeTitle: string;
let tagName: string;
let tagId: number;

test.beforeAll(async ({ browser }) => {
    const stamp = Date.now().toString(36);

    recipeTitle = `Tagged recipe ${stamp}`;
    tagName = `Tag ${stamp}`;
    // reuses the shared viewer account (registered once in global-setup) instead of registering a fresh one here
    context = await browser.newContext({ storageState: VIEWER_STORAGE_STATE });
    page = await context.newPage();

    ({ recipeId } = await createRecipeViaForm(page, {
        title: recipeTitle,
        description: "Created by tags e2e.",
        ingredient: "Milk",
        cookingHours: "0",
        cookingMinutes: "10",
    }));
});

test.afterAll(async () => {
    await page.goto(`/recipe/${recipeId}`);
    await page.getByRole("button", { name: "Delete recipe" }).click();
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "Delete recipe" })
        .click();
    await expect(page).toHaveURL(/\/all-recipes$/);

    await context.close();
});

const openEditor = async (): Promise<void> => {
    await page.goto(`/recipe/${recipeId}`);
    await page.getByRole("button", { name: "Edit tags" }).click();
};

test("should create a tag on a recipe and keep it after a reload", async () => {
    await openEditor();
    await page.getByLabel("New tag name").fill(tagName);

    const [created] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/tags") &&
                res.request().method() === "POST",
        ),
        page.getByRole("button", { name: "Add tag" }).click(),
    ]);

    expect(created.status()).toBe(201);
    ({ id: tagId } = (await created.json()) as { id: number });
    await expect(page.getByRole("checkbox", { name: tagName })).toHaveAttribute(
        "aria-checked",
        "true",
    );

    await page.goto(`/recipe/${recipeId}`);
    await expect(page.getByText(tagName)).toBeVisible();
});

test("should filter the recipe list by the tag", async () => {
    await page.goto(`/all-recipes?tags=${tagId}`);

    await expect(page.getByRole("article")).toHaveCount(1);
    await expect(page.getByRole("article")).toContainText(recipeTitle);
});

test("should take the tag off the recipe and delete it", async () => {
    await openEditor();

    const [saved] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes(`/api/recipe/${recipeId}/tags`) &&
                res.request().method() === "PUT",
        ),
        page.getByRole("checkbox", { name: tagName }).click(),
    ]);

    expect(saved.status()).toBe(204);
    await expect(page.getByRole("checkbox", { name: tagName })).toHaveAttribute(
        "aria-checked",
        "false",
    );

    // cleanup: leave the shared viewer account with no tags of its own
    await page.getByRole("button", { name: `Delete ${tagName}` }).click();
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "Delete" })
        .click();
    await expect(page.getByRole("checkbox", { name: tagName })).toBeHidden();
});
