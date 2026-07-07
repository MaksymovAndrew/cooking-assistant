import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { createMenuViaForm, createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE, readSharedAccounts } from "./sharedAccounts";

// visits every private route once - a redesign that breaks a page's heading
// or renders a blank screen fails here even if no other spec touches that route
test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let page: Page;
let runId: string;
let recipeId: string;
let menuId: string;

test.beforeAll(async ({ browser }) => {
    runId = Date.now().toString(36);
    // reuses the shared primary account (registered once in global-setup) instead of
    // registering a fresh one here - keeps the suite's total auth calls low
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();
});

test.afterAll(async () => {
    await context.close();
});

test("should create a recipe from /add-recipe and capture its id", async () => {
    await page.goto("/add-recipe");
    await expect(
        page.getByRole("heading", { name: "Add New Recipe" }),
    ).toBeVisible();

    const created = await createRecipeViaForm(page, {
        title: `Routes recipe ${runId}`,
        description: "Created by routes-smoke e2e.",
        ingredient: "Tomato",
        cookingTime: "0:15",
        servings: "a couple of bowls",
    });

    recipeId = created.recipeId;
    expect(recipeId).toBeTruthy();
});

test("should create a menu from /add-menu and capture its id", async () => {
    await page.goto("/add-menu");
    await expect(
        page.getByRole("heading", { name: "Add New Menu" }),
    ).toBeVisible();

    const created = await createMenuViaForm(page, {
        title: `Routes menu ${runId}`,
        description: "Created by routes-smoke e2e.",
        recipeTitle: `Routes recipe ${runId}`,
    });

    menuId = created.menuId;
    expect(menuId).toBeTruthy();
});

test("should render the home dashboard at /", async () => {
    const { primary } = readSharedAccounts();

    await page.goto("/");
    await expect(page.getByText(`Welcome back, ${primary.name}`)).toBeVisible();
});

test("should render /all-recipes", async () => {
    await page.goto("/all-recipes");
    await expect(
        page.getByRole("heading", { name: "All Recipes", exact: true }),
    ).toBeVisible();
});

test("should render /my-recipes with the created recipe listed", async () => {
    await page.goto("/my-recipes");
    await expect(
        page.getByRole("heading", { name: "My Recipes", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(`Routes recipe ${runId}`)).toBeVisible();
});

test("should render /profile", async () => {
    await page.goto("/profile");
    // no literal "Profile" heading exists - its h1 shows the user's own name
    await expect(page.getByRole("tab", { name: "My recipes" })).toBeVisible();
});

test("should render /settings", async () => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
});

test("should render /ingredients", async () => {
    await page.goto("/ingredients");
    await expect(
        page.getByRole("heading", { name: "My Ingredients" }),
    ).toBeVisible();
});

test("should render /stats", async () => {
    await page.goto("/stats");
    await expect(
        page.getByRole("heading", { name: "Recipe Statistics" }),
    ).toBeVisible();
});

test("should render /all-menus", async () => {
    await page.goto("/all-menus");
    await expect(
        page.getByRole("heading", { name: "All menus", exact: true }),
    ).toBeVisible();
});

test("should render /my-menus with the created menu listed", async () => {
    await page.goto("/my-menus");
    await expect(
        page.getByRole("heading", { name: "My Menus", exact: true }),
    ).toBeVisible();
    await expect(page.getByText(`Routes menu ${runId}`)).toBeVisible();
});

test("should render /recipe/:id", async () => {
    await page.goto(`/recipe/${recipeId}`);
    await expect(
        page.getByRole("heading", { name: `Routes recipe ${runId}` }),
    ).toBeVisible();
});

test("should render /change-recipe/:id", async () => {
    await page.goto(`/change-recipe/${recipeId}`);
    await expect(
        page.getByRole("heading", { name: "Edit Recipe" }),
    ).toBeVisible();
});

test("should render /menu/:id", async () => {
    await page.goto(`/menu/${menuId}`);
    await expect(
        page.getByRole("heading", { name: `Routes menu ${runId}` }),
    ).toBeVisible();
});

test("should render /change-menu/:id", async () => {
    await page.goto(`/change-menu/${menuId}`);
    await expect(
        page.getByRole("heading", { name: "Edit Menu" }),
    ).toBeVisible();
});

test("should render the not-found page for an unknown route", async () => {
    await page.goto("/this-route-does-not-exist");
    await expect(
        page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
});
