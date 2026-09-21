import type { BrowserContext, Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE, VIEWER_STORAGE_STATE } from "./sharedAccounts";

// another user rates a recipe, changes the vote and takes it back; the owner and a guest get no stars
test.describe.configure({ mode: "serial" });

const YOUR_RATING = "Your rating";

let ownerContext: BrowserContext;
let viewerContext: BrowserContext;
let viewerPage: Page;
let recipeId: string;
let recipeTitle: string;

test.beforeAll(async ({ browser }) => {
    recipeTitle = `Rated recipe ${Date.now().toString(36)}`;
    ownerContext = await browser.newContext({
        storageState: PRIMARY_STORAGE_STATE,
    });
    viewerContext = await browser.newContext({
        storageState: VIEWER_STORAGE_STATE,
    });
    viewerPage = await viewerContext.newPage();

    ({ recipeId } = await createRecipeViaForm(await ownerContext.newPage(), {
        title: recipeTitle,
        description: "Created by ratings e2e.",
        ingredient: "Tomato",
        cookingHours: "0",
        cookingMinutes: "20",
    }));
});

test.afterAll(async () => {
    await ownerContext.close();
    await viewerContext.close();
});

async function vote(
    page: Page,
    control: Locator,
    method: "PUT" | "DELETE",
): Promise<void> {
    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes(`/api/recipe/${recipeId}/rating`) &&
                res.request().method() === method,
        ),
        control.click(),
    ]);

    expect(response.status()).toBe(204);
}

test("should let another user rate the recipe and keep the vote", async () => {
    await viewerPage.goto(`/recipe/${recipeId}`);
    await expect(
        viewerPage.getByRole("img", { name: "No ratings yet" }),
    ).toBeVisible();

    await vote(
        viewerPage,
        viewerPage.getByRole("radio", { name: "4 stars" }),
        "PUT",
    );

    await expect(
        viewerPage.getByRole("img", {
            name: "Rated 4.0 out of 5 from 1 rating",
        }),
    ).toBeVisible();

    await viewerPage.reload();

    await expect(
        viewerPage.getByRole("radio", { name: "4 stars" }),
    ).toBeChecked();
});

test("should list the recipe under the top-rated filter", async () => {
    await viewerPage.goto(
        `/all-recipes?q=${encodeURIComponent(recipeTitle)}&top=1`,
    );

    await expect(
        viewerPage.getByRole("article").filter({ hasText: recipeTitle }),
    ).toBeVisible();
});

test("should change the vote and then take it back", async () => {
    await viewerPage.goto(`/recipe/${recipeId}`);

    await vote(
        viewerPage,
        viewerPage.getByRole("radio", { name: "2 stars" }),
        "PUT",
    );
    await expect(
        viewerPage.getByRole("img", {
            name: "Rated 2.0 out of 5 from 1 rating",
        }),
    ).toBeVisible();

    await vote(
        viewerPage,
        viewerPage.getByRole("button", { name: "Remove my rating" }),
        "DELETE",
    );
    await viewerPage.reload();

    await expect(
        viewerPage.getByRole("img", { name: "No ratings yet" }),
    ).toBeVisible();
    await expect(
        viewerPage.getByRole("radio", { name: "2 stars" }),
    ).not.toBeChecked();
});

test("should not offer the stars to the owner or to a guest", async ({
    browser,
}) => {
    const ownerPage = await ownerContext.newPage();
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    await ownerPage.goto(`/recipe/${recipeId}`);
    await guestPage.goto(`/recipe/${recipeId}`);

    for (const page of [ownerPage, guestPage]) {
        await expect(
            page.getByRole("heading", { name: recipeTitle }),
        ).toBeVisible();
        await expect(
            page.getByRole("radiogroup", { name: YOUR_RATING }),
        ).toHaveCount(0);
    }

    await guestContext.close();
});
