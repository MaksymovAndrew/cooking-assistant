import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { createMenuViaForm, createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE, VIEWER_STORAGE_STATE } from "./sharedAccounts";

// recipes and menus are a shared cookbook (public read) but only their owner
// can edit/delete them - verifies both the UI gating and the server-side 404
test.describe.configure({ mode: "serial" });

let ownerContext: BrowserContext;
let viewerContext: BrowserContext;
let ownerPage: Page;
let viewerPage: Page;
let runId: string;
let recipeId: string;
let menuId: string;
let recipeTitle: string;
let menuTitle: string;

test.beforeAll(async ({ browser }) => {
    runId = Date.now().toString(36);
    recipeTitle = `Ownership recipe ${runId}`;
    menuTitle = `Ownership menu ${runId}`;
    // reuses the shared primary/viewer accounts (registered once in global-setup)
    // instead of registering fresh ones here - keeps the suite's total auth calls low
    ownerContext = await browser.newContext({
        storageState: PRIMARY_STORAGE_STATE,
    });
    viewerContext = await browser.newContext({
        storageState: VIEWER_STORAGE_STATE,
    });
    ownerPage = await ownerContext.newPage();
    viewerPage = await viewerContext.newPage();

    ({ recipeId } = await createRecipeViaForm(ownerPage, {
        title: recipeTitle,
        description: "Created by ownership e2e.",
        ingredient: "Tomato",
        cookingHours: "0",
        cookingMinutes: "10",
    }));
    ({ menuId } = await createMenuViaForm(ownerPage, {
        title: menuTitle,
        description: "Created by ownership e2e.",
        recipeTitle,
    }));
});

test.afterAll(async () => {
    await ownerContext.close();
    await viewerContext.close();
});

test("should let another user view the recipe but hide owner-only controls", async () => {
    await viewerPage.goto(`/recipe/${recipeId}`);
    await expect(
        viewerPage.getByRole("heading", { name: recipeTitle }),
    ).toBeVisible();
    await expect(
        viewerPage.getByRole("button", { name: "Edit recipe" }),
    ).toHaveCount(0);
    await expect(
        viewerPage.getByRole("button", { name: "Delete recipe" }),
    ).toHaveCount(0);
});

test("should let another user view the menu but hide owner-only controls", async () => {
    await viewerPage.goto(`/menu/${menuId}`);
    await expect(
        viewerPage.getByRole("heading", { name: menuTitle }),
    ).toBeVisible();
    await expect(
        viewerPage.getByRole("button", { name: "Edit menu" }),
    ).toHaveCount(0);
    await expect(
        viewerPage.getByRole("button", { name: "Delete menu" }),
    ).toHaveCount(0);
});

async function loadUntilVisible(page: Page, text: string): Promise<void> {
    await expect(async () => {
        const loadMore = page.getByRole("button", { name: "Load more" });
        if (await loadMore.isVisible().catch(() => false)) {
            await loadMore.click();
        }
        await expect(page.getByText(text)).toBeVisible({ timeout: 1000 });
    }).toPass({ timeout: 30_000 });
}

test("should list the recipe and menu in the shared public listings", async () => {
    // sorted by cooking time by default (not newest-first), so a freshly
    // created item can land on any page once the list has grown large
    await viewerPage.goto("/all-recipes");
    await loadUntilVisible(viewerPage, recipeTitle);
    await expect(viewerPage.getByText(recipeTitle)).toBeVisible();

    await viewerPage.goto("/all-menus");
    await loadUntilVisible(viewerPage, menuTitle);
    await expect(viewerPage.getByText(menuTitle)).toBeVisible();
});

test("should refuse a non-owner's recipe update on the server", async () => {
    await viewerPage.goto(`/change-recipe/${recipeId}`);
    await expect(viewerPage.getByLabel("Title")).toHaveValue(recipeTitle);

    const [response] = await Promise.all([
        viewerPage.waitForResponse(
            (res) =>
                res.url().includes(`/api/recipe/${recipeId}`) &&
                res.request().method() === "PUT",
        ),
        viewerPage.getByRole("button", { name: "Save changes" }).click(),
    ]);

    expect(response.status()).toBe(404);
    await expect(viewerPage).toHaveURL(
        new RegExp(`/change-recipe/${recipeId}$`),
    );
});

test("should refuse a non-owner's menu update on the server", async () => {
    await viewerPage.goto(`/change-menu/${menuId}`);
    await expect(viewerPage.getByLabel("Menu title")).toHaveValue(menuTitle);

    const [response] = await Promise.all([
        viewerPage.waitForResponse(
            (res) =>
                res.url().includes(`/api/menu/${menuId}`) &&
                res.request().method() === "PUT",
        ),
        viewerPage.getByRole("button", { name: "Save changes" }).click(),
    ]);

    expect(response.status()).toBe(404);
    await expect(viewerPage).toHaveURL(new RegExp(`/change-menu/${menuId}$`));
});
