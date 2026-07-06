import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

// serial + a shared page: the httpOnly auth cookie must carry across tests
test.describe.configure({ mode: "serial" });

let page: Page;
let login: string;
let password: string;
let recipeTitle: string;
let menuTitle: string;

const NAME = "Playwright";

test.beforeAll(async ({ browser }) => {
    const runId = Date.now().toString(36);
    login = `e2e-${runId}`;
    // throwaway per-run account, so the login doubles as its password
    password = login;
    recipeTitle = `Smoke recipe ${runId}`;
    menuTitle = `Smoke menu ${runId}`;
    page = await browser.newPage();
});

test.afterAll(async () => {
    await page.close();
});

test("should register a new account", async () => {
    await page.goto("/registration");
    await page.getByLabel("Name:", { exact: true }).fill(NAME);
    await page.getByLabel("Surname:", { exact: true }).fill("Smoke");
    await page.getByLabel("Username:", { exact: true }).fill(login);
    await page.getByLabel("Password:", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/login$/);
});

test("should log in and land on the dashboard", async () => {
    await page.getByLabel("Username:", { exact: true }).fill(login);
    await page.getByLabel("Password:", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Log In" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByText(`Welcome back, ${NAME}`)).toBeVisible();
});

test("should create a recipe and list it under My Recipes", async () => {
    await page.goto("/add-recipe");
    await page.getByLabel("Title").fill(recipeTitle);
    await page
        .getByLabel("Description")
        .fill("Created by the e2e smoke suite.");
    await page.getByLabel("Cooking Time").fill("0:30");
    await page.getByLabel("Recipe Type").selectOption({ index: 1 });
    await page.getByRole("button", { name: "Tomato", exact: true }).click();
    await page.getByLabel("Servings").fill("2 servings");
    await page.getByRole("button", { name: "Create Recipe" }).click();
    await expect(page).toHaveURL(/\/all-recipes$/);

    await page.goto("/my-recipes");
    await expect(page.getByText(recipeTitle)).toBeVisible();
});

test("should create a menu from that recipe and list it under My Menus", async () => {
    await page.goto("/add-menu");
    await page.getByLabel("Menu title").fill(menuTitle);
    await page
        .getByLabel("Menu description")
        .fill("Created by the e2e smoke suite.");
    await page.getByLabel("Menu category").selectOption({ index: 1 });
    await page.getByRole("button", { name: recipeTitle }).click();
    await page.getByRole("button", { name: "Create Menu" }).click();
    await page.waitForURL((url) => !url.pathname.includes("add-menu"));

    await page.goto("/my-menus");
    await expect(page.getByText(menuTitle)).toBeVisible();
});

test("should add a pantry ingredient", async () => {
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "Edit ingredients" }).click();
    await page.getByRole("button", { name: "Tomato", exact: true }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Ingredients saved")).toBeVisible();
    await expect(page.getByText("Tomato")).toBeVisible();
});

test("should render the statistics page", async () => {
    await page.goto("/stats");
    await expect(page.getByText("Recipe Statistics")).toBeVisible();
});

test("should log out and protect private routes again", async () => {
    await page.goto("/");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
});
