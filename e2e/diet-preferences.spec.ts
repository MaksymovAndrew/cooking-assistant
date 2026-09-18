import type { BrowserContext, Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE, VIEWER_STORAGE_STATE } from "./sharedAccounts";

// the avoid list: picked in the profile, then marked on the recipe card and page and hideable with one filter
test.describe.configure({ mode: "serial" });

let ownerContext: BrowserContext;
let viewerContext: BrowserContext;
let viewerPage: Page;
let recipeId: string;
let recipeTitle: string;

test.beforeAll(async ({ browser }) => {
    recipeTitle = `Avoided recipe ${Date.now().toString(36)}`;
    // reuses the shared primary/viewer accounts (registered once in global-setup) instead of registering fresh ones here - keeps the suite's total auth calls low
    ownerContext = await browser.newContext({
        storageState: PRIMARY_STORAGE_STATE,
    });
    viewerContext = await browser.newContext({
        storageState: VIEWER_STORAGE_STATE,
    });
    viewerPage = await viewerContext.newPage();

    ({ recipeId } = await createRecipeViaForm(await ownerContext.newPage(), {
        title: recipeTitle,
        description: "Created by diet preferences e2e.",
        ingredient: "Milk",
        cookingHours: "0",
        cookingMinutes: "10",
    }));
});

test.afterAll(async () => {
    const ownerPage = await ownerContext.newPage();

    await ownerPage.goto(`/recipe/${recipeId}`);
    await ownerPage.getByRole("button", { name: "Delete recipe" }).click();
    await ownerPage
        .getByRole("dialog")
        .getByRole("button", { name: "Delete recipe" })
        .click();
    await expect(ownerPage).toHaveURL(/\/all-recipes$/);

    await ownerContext.close();
    await viewerContext.close();
});

async function openFoodPreferences(): Promise<void> {
    await viewerPage.goto("/profile");
    await viewerPage.getByRole("tab", { name: "Dietary" }).click();
    await expect(
        viewerPage.getByRole("heading", { name: "Food preferences" }),
    ).toBeVisible();
}

async function pressAndSave(
    control: Locator,
    path: string,
    method: "PUT" | "DELETE",
): Promise<void> {
    await expect(control).toBeEnabled();

    const [response] = await Promise.all([
        viewerPage.waitForResponse(
            (res) =>
                res.url().includes(path) && res.request().method() === method,
        ),
        control.click(),
    ]);

    expect(response.status()).toBe(204);
}

test("should save an avoided allergen and keep it after a reload", async () => {
    await openFoodPreferences();
    const milk = viewerPage.getByRole("checkbox", { name: "Milk" });

    await expect(milk).toHaveAttribute("aria-checked", "false");
    await pressAndSave(milk, "/diet-preferences/allergens/milk", "PUT");
    await expect(milk).toHaveAttribute("aria-checked", "true");
    await expect(viewerPage.getByText("Saved just now")).toBeVisible();

    await openFoodPreferences();
    await expect(
        viewerPage.getByRole("checkbox", { name: "Milk" }),
    ).toHaveAttribute("aria-checked", "true");
});

test("should mark the recipe and hide it with the filter", async () => {
    const query = encodeURIComponent(recipeTitle);

    await viewerPage.goto(`/all-recipes?q=${query}`);
    const card = viewerPage.getByRole("article").filter({
        hasText: recipeTitle,
    });

    await expect(card.getByText("Avoid", { exact: true })).toBeVisible();

    await viewerPage.goto(`/recipe/${recipeId}`);
    await expect(viewerPage.getByText("You avoid this").first()).toBeAttached();

    await viewerPage.goto(`/all-recipes?q=${query}&avoid=1`);
    await expect(
        viewerPage.getByText("No recipes match your search"),
    ).toBeVisible();
});

test("should avoid an ingredient from the catalog search and take it back off", async () => {
    await openFoodPreferences();
    await viewerPage
        .getByPlaceholder("Search ingredients to avoid…")
        .fill("Garlic");
    await pressAndSave(
        viewerPage.getByRole("button", { name: "Garlic", exact: true }),
        "/avoid",
        "PUT",
    );

    const remove = viewerPage.getByRole("button", {
        name: "Stop avoiding Garlic",
    });

    await expect(remove).toBeVisible();
    await pressAndSave(remove, "/avoid", "DELETE");
    await expect(remove).toBeHidden();

    // cleanup: leave the shared viewer account avoiding nothing
    await pressAndSave(
        viewerPage.getByRole("checkbox", { name: "Milk" }),
        "/diet-preferences/allergens/milk",
        "DELETE",
    );
});
