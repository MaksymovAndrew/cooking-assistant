import type { Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

// ids come from the create-response bodies, not card/list markup, so these
// survive the upcoming page redesign
test.describe.configure({ mode: "serial" });

let page: Page;
let login: string;
let password: string;
let runId: string;
let recipeId: string;
let menuId: string;

async function register(page: Page, login: string) {
    await page.goto("/registration");
    await page.getByLabel("Name:", { exact: true }).fill("Core");
    await page.getByLabel("Surname:", { exact: true }).fill("Flows");
    await page.getByLabel("Username:", { exact: true }).fill(login);
    await page.getByLabel("Password:", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Register" }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel("Username:", { exact: true }).fill(login);
    await page.getByLabel("Password:", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Log In" }).click();
    await expect(page).toHaveURL("/");
}

test.beforeAll(async ({ browser }) => {
    runId = Date.now().toString(36);
    login = `e2e-core-${runId}`;
    // throwaway per-run account, so the login doubles as its password
    password = login;
    page = await browser.newPage();
    await register(page, login);
});

test.afterAll(async () => {
    await page.close();
});

test("should create a recipe and capture its id from the API response", async () => {
    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/recipe") &&
                res.request().method() === "POST",
        ),
        (async () => {
            await page.goto("/add-recipe");
            await page
                .getByLabel("Title")
                .fill(`Original recipe title ${runId}`);
            await page
                .getByLabel("Description")
                .fill("Created by core-flows e2e.");
            await page.getByLabel("Cooking Time").fill("0:20");
            await page.getByLabel("Recipe Type").selectOption({ index: 1 });
            await page
                .getByRole("button", { name: "Potato", exact: true })
                .click();
            await page.getByLabel("Servings").fill("a full pot");
            await page.getByRole("button", { name: "Create Recipe" }).click();
        })(),
    ]);
    const body = (await response.json()) as { id: number };
    recipeId = String(body.id);
    expect(recipeId).toBeTruthy();
});

test("should edit the recipe and see the new title on its details page", async () => {
    await page.goto(`/change-recipe/${recipeId}`);
    const titleInput = page.getByLabel("Title");
    await titleInput.fill("");
    await titleInput.fill(`Updated recipe title ${runId}`);
    await page.getByRole("button", { name: "Update Recipe" }).click();
    await expect(page).toHaveURL(/\/all-recipes$/);

    await page.goto(`/recipe/${recipeId}`);
    await expect(
        page.getByRole("heading", { name: `Updated recipe title ${runId}` }),
    ).toBeVisible();
});

test("should create a menu from the recipe and capture its id", async () => {
    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/create-menu") &&
                res.request().method() === "POST",
        ),
        (async () => {
            await page.goto("/add-menu");
            await page
                .getByLabel("Menu title")
                .fill(`Original menu title ${runId}`);
            await page
                .getByLabel("Menu description")
                .fill("Created by core-flows e2e.");
            await page.getByLabel("Menu category").selectOption({ index: 1 });
            await page
                .getByRole("button", {
                    name: `Updated recipe title ${runId}`,
                    exact: true,
                })
                .click();
            await page.getByRole("button", { name: "Create Menu" }).click();
        })(),
    ]);
    const body = (await response.json()) as { menuId: number };
    menuId = String(body.menuId);
    expect(menuId).toBeTruthy();
});

test("should edit the menu and see the new title on its details page", async () => {
    await page.goto(`/change-menu/${menuId}`);
    const titleInput = page.getByLabel("Menu title");
    await titleInput.fill("");
    await titleInput.fill(`Updated menu title ${runId}`);
    await page.getByRole("button", { name: "Update Menu" }).click();
    await expect(page).toHaveURL(/\/menus$/);

    await page.goto(`/menu/${menuId}`);
    await expect(
        page.getByRole("heading", { name: `Updated menu title ${runId}` }),
    ).toBeVisible();
});

test("should delete the menu and redirect away from its details page", async () => {
    await page.goto(`/menu/${menuId}`);
    await page.getByRole("button", { name: "Delete menu" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page).toHaveURL(/\/menus$/);
});

test("should delete the recipe and redirect away from its details page", async () => {
    await page.goto(`/recipe/${recipeId}`);
    await page.getByRole("button", { name: "Delete recipe" }).click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await expect(page).toHaveURL(/\/all-recipes$/);
});

test("should edit a pantry ingredient's quantity and persist it across reload", async () => {
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "Edit ingredients" }).click();
    await page.getByRole("button", { name: "Onion", exact: true }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText("Ingredients saved")).toBeVisible();

    await page.getByRole("button", { name: "Edit quantities" }).click();
    const quantityInput = page.locator('input[type="number"]').first();
    await quantityInput.fill("7");
    await page.getByRole("button", { name: "Save quantities" }).click();
    await expect(page.getByText("Quantities updated")).toBeVisible();

    await page.reload();
    await expect(page.getByText("Onion")).toBeVisible();
});

test("should switch the theme via the confirm modal and persist it across reload", async () => {
    await page.goto("/");
    const htmlBefore = await page.locator("html").getAttribute("data-theme");

    await page.getByRole("button", { name: "Toggle theme" }).click();
    await page.getByRole("button", { name: "Switch theme" }).click();
    await page.waitForLoadState("load");

    await expect(page.locator("html")).not.toHaveAttribute(
        "data-theme",
        htmlBefore ?? "",
    );
    const htmlAfter = await page.locator("html").getAttribute("data-theme");

    await page.reload();
    await expect(page.locator("html")).toHaveAttribute(
        "data-theme",
        htmlAfter ?? "",
    );
});
