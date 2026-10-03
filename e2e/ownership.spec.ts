import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { deleteMenu, deleteRecipe } from "./api";
import { createMenuViaForm, createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE, VIEWER_STORAGE_STATE } from "./sharedAccounts";

// only the page is checked here; the server's 404 is pinned by the route and repository tests
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
    try {
        await deleteMenu(ownerContext.request, menuId);
        await deleteRecipe(ownerContext.request, recipeId);
    } finally {
        await ownerContext.close();
        await viewerContext.close();
    }
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

test("should list the recipe and menu in the shared public listings", async () => {
    await viewerPage.goto(`/all-recipes?q=${encodeURIComponent(recipeTitle)}`);
    await expect(
        viewerPage.getByRole("article").filter({ hasText: recipeTitle }),
    ).toBeVisible();

    await viewerPage.goto(`/all-menus?q=${encodeURIComponent(menuTitle)}`);
    await expect(
        viewerPage.getByRole("article").filter({ hasText: menuTitle }),
    ).toBeVisible();
});

test("should refuse a non-owner's recipe update on the page", async () => {
    await viewerPage.goto(`/change-recipe/${recipeId}`);
    await expect(
        viewerPage.getByRole("heading", {
            name: "This recipe can't be edited",
        }),
    ).toBeVisible();
    await expect(viewerPage.getByLabel("Title")).toHaveCount(0);
});

test("should refuse a non-owner's menu update on the page", async () => {
    await viewerPage.goto(`/change-menu/${menuId}`);
    await expect(
        viewerPage.getByRole("heading", { name: "This menu can't be edited" }),
    ).toBeVisible();
    await expect(viewerPage.getByLabel("Menu title")).toHaveCount(0);
});
