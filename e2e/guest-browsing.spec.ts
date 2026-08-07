import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { createMenuViaForm, createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// a fully anonymous visitor - the third persona alongside owner/viewer in ownership.spec.ts.
// covers the guest landing page and confirms browsing stays read-only with no session leaked in
test.describe.configure({ mode: "serial" });

let ownerContext: BrowserContext;
let guestContext: BrowserContext;
let ownerPage: Page;
let guestPage: Page;
let runId: string;
let recipeId: string;
let menuId: string;
let recipeTitle: string;
let menuTitle: string;

test.beforeAll(async ({ browser }) => {
    runId = Date.now().toString(36);
    recipeTitle = `Guest browsing recipe ${runId}`;
    menuTitle = `Guest browsing menu ${runId}`;
    // reuses the shared primary account (registered once in global-setup) as the owner; the
    // guest context is a fresh, cookie-less browser context - no storageState at all
    ownerContext = await browser.newContext({
        storageState: PRIMARY_STORAGE_STATE,
    });
    guestContext = await browser.newContext();
    ownerPage = await ownerContext.newPage();
    guestPage = await guestContext.newPage();

    ({ recipeId } = await createRecipeViaForm(ownerPage, {
        title: recipeTitle,
        description: "Created by guest-browsing e2e.",
        ingredient: "Tomato",
        cookingHours: "0",
        cookingMinutes: "10",
    }));
    ({ menuId } = await createMenuViaForm(ownerPage, {
        title: menuTitle,
        description: "Created by guest-browsing e2e.",
        recipeTitle,
    }));
});

test.afterAll(async () => {
    await ownerContext.close();
    await guestContext.close();
});

test("should show the guest landing page at / instead of redirecting to login", async () => {
    await guestPage.goto("/");
    await expect(guestPage.getByText("Browsing as guest")).toBeVisible();
    await expect(
        guestPage.getByRole("link", { name: "Log In" }).first(),
    ).toBeVisible();
});

test("should let a guest browse the recipe list and open a recipe with no owner or favourite controls", async () => {
    await guestPage.goto("/all-recipes");
    await expect(
        guestPage.getByRole("heading", { name: "All Recipes", exact: true }),
    ).toBeVisible();

    await guestPage.goto(`/recipe/${recipeId}`);
    await expect(
        guestPage.getByRole("heading", { name: recipeTitle }),
    ).toBeVisible();
    await expect(
        guestPage.getByRole("button", { name: "Favourite" }),
    ).toHaveCount(0);
    await expect(
        guestPage.getByRole("button", { name: "Edit recipe" }),
    ).toHaveCount(0);
    await expect(
        guestPage.getByRole("button", { name: "Log intake" }),
    ).toHaveCount(0);
});

test("should let a guest browse the menu list and open a menu with no owner controls", async () => {
    await guestPage.goto("/all-menus");
    await expect(
        guestPage.getByRole("heading", { name: "All menus", exact: true }),
    ).toBeVisible();

    await guestPage.goto(`/menu/${menuId}`);
    await expect(
        guestPage.getByRole("heading", { name: menuTitle }),
    ).toBeVisible();
    await expect(
        guestPage.getByRole("button", { name: "Edit menu" }),
    ).toHaveCount(0);
    await expect(
        guestPage.getByRole("button", { name: "Delete menu" }),
    ).toHaveCount(0);
});

test("should still redirect a guest away from private routes to login", async () => {
    await guestPage.goto("/profile");
    await expect(guestPage).toHaveURL(/\/login$/);

    await guestPage.goto("/add-recipe");
    await expect(guestPage).toHaveURL(/\/login$/);
});
