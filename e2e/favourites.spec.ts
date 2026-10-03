import type { BrowserContext, Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { deleteMenu, deleteRecipe } from "./api";
import { createMenuViaForm, createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE, VIEWER_STORAGE_STATE } from "./sharedAccounts";

test.describe.configure({ mode: "serial" });

let ownerContext: BrowserContext;
let viewerContext: BrowserContext;
let viewerPage: Page;
let recipeId: string;
let menuId: string;
let recipeTitle: string;
let menuTitle: string;

test.beforeAll(async ({ browser }) => {
    const runId = Date.now().toString(36);

    recipeTitle = `Favourite recipe ${runId}`;
    menuTitle = `Favourite menu ${runId}`;
    ownerContext = await browser.newContext({
        storageState: PRIMARY_STORAGE_STATE,
    });
    viewerContext = await browser.newContext({
        storageState: VIEWER_STORAGE_STATE,
    });
    const ownerPage = await ownerContext.newPage();

    viewerPage = await viewerContext.newPage();

    ({ recipeId } = await createRecipeViaForm(ownerPage, {
        title: recipeTitle,
        description: "Created by favourites e2e.",
        ingredient: "Tomato",
        cookingHours: "0",
        cookingMinutes: "10",
    }));
    ({ menuId } = await createMenuViaForm(ownerPage, {
        title: menuTitle,
        description: "Created by favourites e2e.",
        recipeTitle,
    }));
});

test.afterAll(async () => {
    // cleanup: deleting the menu and recipe takes the viewer's favourites with them
    try {
        await deleteMenu(ownerContext.request, menuId);
        await deleteRecipe(ownerContext.request, recipeId);
    } finally {
        await ownerContext.close();
        await viewerContext.close();
    }
});

async function pressHeart(
    heart: Locator,
    method: "PUT" | "DELETE",
): Promise<void> {
    const [response] = await Promise.all([
        viewerPage.waitForResponse(
            (res) =>
                res.url().includes("/favourite") &&
                res.request().method() === method,
        ),
        heart.click(),
    ]);

    expect(response.status()).toBe(204);
}

test("should favourite a recipe from its page and keep it after a reload", async () => {
    await viewerPage.goto(`/recipe/${recipeId}`);
    const heart = viewerPage.getByRole("button", { name: "Favourite" }).first();

    await expect(heart).toHaveAttribute("aria-pressed", "false");
    await pressHeart(heart, "PUT");
    await expect(heart).toHaveAttribute("aria-pressed", "true");

    await viewerPage.reload();
    await expect(
        viewerPage.getByRole("button", { name: "Favourite" }).first(),
    ).toHaveAttribute("aria-pressed", "true");
});

test("should favourite a menu from its page", async () => {
    await viewerPage.goto(`/menu/${menuId}`);
    const heart = viewerPage.getByRole("button", { name: "Favourite" });

    await pressHeart(heart, "PUT");
    await expect(heart).toHaveAttribute("aria-pressed", "true");
});

test("should list both in the profile favourites tab", async () => {
    await viewerPage.goto("/profile");
    await viewerPage.getByRole("tab", { name: "Favourites" }).click();
    await expect(
        viewerPage.getByRole("heading", { name: recipeTitle }),
    ).toBeVisible();

    await viewerPage.getByRole("radio", { name: "Menus" }).click();
    await expect(
        viewerPage.getByRole("heading", { name: menuTitle }),
    ).toBeVisible();
});

test("should narrow the recipe list to favourites and unfavourite from the card", async () => {
    await viewerPage.goto(
        `/all-recipes?fav=1&q=${encodeURIComponent(recipeTitle)}`,
    );
    const card = viewerPage
        .getByRole("article")
        .filter({ hasText: recipeTitle });

    await expect(card).toBeVisible();
    await pressHeart(card.getByRole("button", { name: "Favourite" }), "DELETE");
    await expect(card).toBeHidden();
});
