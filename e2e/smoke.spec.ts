import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { selectFromPicker } from "./forms";

// serial + a shared page: the httpOnly auth cookie must carry across tests
test.describe.configure({ mode: "serial" });

let page: Page;
let login: string;
let email: string;
let password: string;
let recipeTitle: string;
let menuTitle: string;

const NAME = "Playwright";

test.beforeAll(async ({ browser }) => {
    const runId = Date.now().toString(36);
    login = `e2e-${runId}`;
    email = `${login}@example.com`;
    // throwaway per-run account; still needs to satisfy the real password policy
    password = `${login}-Aa1!`;
    recipeTitle = `Smoke recipe ${runId}`;
    menuTitle = `Smoke menu ${runId}`;
    page = await browser.newPage();
});

test.afterAll(async () => {
    await page.close();
});

test("should register a new account and land on the dashboard already logged in", async () => {
    await page.goto("/registration");
    await page.getByLabel("Name:", { exact: true }).fill(NAME);
    await page.getByLabel("Surname:", { exact: true }).fill("Smoke");
    await page.getByLabel("Username", { exact: true }).fill(login);
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByText(`Welcome back, ${NAME}`)).toBeVisible();
});

test("should log out, then log back in with the email identifier", async () => {
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByRole("radio", { name: "Email" }).click();
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
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
    await page.getByLabel("Cooking time").fill("0");
    await page.getByLabel("Minutes").fill("30");
    await page.getByLabel("Recipe type").selectOption({ index: 1 });
    await selectFromPicker(page, page.getByLabel("Ingredients"), "Tomato");
    await page.getByRole("button", { name: "Create recipe" }).click();
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
    await selectFromPicker(page, page.getByLabel("Recipes"), recipeTitle);
    await page.getByRole("button", { name: "Create menu" }).click();
    await page.waitForURL((url) => !url.pathname.includes("add-menu"));

    await page.goto("/my-menus");
    await expect(page.getByText(menuTitle)).toBeVisible();
});

test("should add a pantry ingredient", async () => {
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await selectFromPicker(
        page,
        page.getByPlaceholder("Search ingredients..."),
        "Tomato",
    );
    await page.getByRole("button", { name: "Add to pantry" }).click();
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
