import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { deleteMenu, deleteRecipe } from "./api";
import { createMenuViaForm, createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE, readSharedAccounts } from "./sharedAccounts";

// visits every route once - a broken heading or blank screen fails here even if no other spec touches that route
test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let guestContext: BrowserContext;
let page: Page;
let guestPage: Page;
let runId: string;
let recipeId: string;
let menuId: string;

const MOBILE_VIEWPORT = { width: 390, height: 844 };
// the int4 ceiling: well-formed, so the lookup itself answers 404 rather than a validation error
const MISSING_RECIPE_ID = 2147483647;
const HTTP_NOT_FOUND = 404;

test.beforeAll(async ({ browser }) => {
    runId = Date.now().toString(36);
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();
    // the sign-in pages are a guest's, so they get a fresh, cookie-less context
    guestContext = await browser.newContext();
    guestPage = await guestContext.newPage();

    ({ recipeId } = await createRecipeViaForm(page, {
        title: `Routes recipe ${runId}`,
        description: "Created by routes-smoke e2e.",
        ingredient: "Tomato",
        cookingHours: "0",
        cookingMinutes: "15",
    }));
    ({ menuId } = await createMenuViaForm(page, {
        title: `Routes menu ${runId}`,
        description: "Created by routes-smoke e2e.",
        recipeTitle: `Routes recipe ${runId}`,
    }));
});

// permanent regression guard: the route each test lands on must not scroll horizontally at 390px
test.afterEach(async () => {
    for (const target of [page, guestPage]) {
        const desktopViewport = target.viewportSize();

        await target.setViewportSize(MOBILE_VIEWPORT);
        await expect
            .poll(() =>
                target.evaluate(
                    () =>
                        document.documentElement.scrollWidth -
                        document.documentElement.clientWidth,
                ),
            )
            .toBeLessThanOrEqual(0);

        if (desktopViewport) {
            await target.setViewportSize(desktopViewport);
        }
    }
});

test.afterAll(async () => {
    try {
        await deleteMenu(context.request, menuId);
        await deleteRecipe(context.request, recipeId);
    } finally {
        await context.close();
        await guestContext.close();
    }
});

test("should render /add-recipe", async () => {
    await page.goto("/add-recipe");
    await expect(
        page.getByRole("heading", { name: "Create recipe" }),
    ).toBeVisible();
});

test("should render /add-menu", async () => {
    await page.goto("/add-menu");
    await expect(
        page.getByRole("heading", { name: "Create menu" }),
    ).toBeVisible();
});

test("should render the home dashboard at /", async () => {
    const { primary } = readSharedAccounts();

    await page.goto("/");
    await expect(page.getByText(`Welcome back, ${primary.name}`)).toBeVisible();
});

test("should render /all-recipes", async () => {
    await page.goto("/all-recipes");
    await expect(
        page.getByRole("heading", { name: "All recipes", exact: true }),
    ).toBeVisible();
});

test("should render /my-recipes with the created recipe listed", async () => {
    await page.goto("/my-recipes");
    await expect(
        page.getByRole("heading", { name: "My recipes", exact: true }),
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
        page.getByRole("heading", { name: "My ingredients" }),
    ).toBeVisible();
});

test("should render /stats", async () => {
    await page.goto("/stats");
    await expect(
        page.getByRole("heading", { name: "Recipe statistics" }),
    ).toBeVisible();
});

test("should render /shopping-list", async () => {
    await page.goto("/shopping-list");
    await expect(
        page.getByRole("heading", { name: "Shopping list", level: 1 }),
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
        page.getByRole("heading", { name: "My menus", exact: true }),
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
    const response = await page.goto("/this-route-does-not-exist");

    expect(response?.status()).toBe(HTTP_NOT_FOUND);
    await expect(
        page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
});

test("should answer a recipe that does not exist with a real 404", async () => {
    const response = await page.goto(`/recipe/${MISSING_RECIPE_ID}`);

    expect(response?.status()).toBe(HTTP_NOT_FOUND);
    await expect(
        page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
});

test("should render /login for a guest", async () => {
    await guestPage.goto("/login");
    await expect(
        guestPage.getByRole("heading", { name: "Welcome back" }),
    ).toBeVisible();
});

test("should render /registration for a guest", async () => {
    await guestPage.goto("/registration");
    await expect(
        guestPage.getByRole("heading", { name: "Create an account" }),
    ).toBeVisible();
});

test("should render /forgot-password for a guest", async () => {
    await guestPage.goto("/forgot-password");
    await expect(
        guestPage.getByRole("heading", { name: "Forgot password" }),
    ).toBeVisible();
});

test("should render /reset-password without a token as an invalid link", async () => {
    await guestPage.goto("/reset-password");
    await expect(
        guestPage.getByRole("heading", { name: "Link invalid or expired" }),
    ).toBeVisible();
    await expect(
        guestPage.getByRole("link", { name: "Request a new link" }),
    ).toBeVisible();
});

test("should render /verify-email without a token as an invalid link", async () => {
    await guestPage.goto("/verify-email");
    await expect(
        guestPage.getByRole("heading", { name: "Link invalid or expired" }),
    ).toBeVisible();
    await expect(
        guestPage.getByRole("link", { name: "Back to log in" }),
    ).toBeVisible();
});
