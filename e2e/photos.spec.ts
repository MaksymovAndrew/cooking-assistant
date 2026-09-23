import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// a recipe photo added from the edit form, shown on the recipe page and its card, then removed;
// and a profile photo uploaded from Edit profile and taken back off
test.describe.configure({ mode: "serial" });

const PHOTO = {
    name: "dish.png",
    mimeType: "image/png",
    buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAEAAAAAwCAIAAAAuKetIAAAARUlEQVR42u3PAQkAMAgAMH0a4xjbWG8hCFuD5XTFZS+OExAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQENjzASpcAaDxeMZRAAAAAElFTkSuQmCC",
        "base64",
    ),
};

let context: BrowserContext;
let page: Page;
let recipeId: string;
let recipeTitle: string;

test.beforeAll(async ({ browser }) => {
    recipeTitle = `Photo recipe ${Date.now().toString(36)}`;
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();

    ({ recipeId } = await createRecipeViaForm(page, {
        title: recipeTitle,
        description: "Created by photos e2e.",
        ingredient: "Tomato",
        cookingHours: "0",
        cookingMinutes: "15",
    }));
});

test.afterAll(async () => {
    await context.close();
});

async function saveRecipeExpecting(method: "PUT" | "DELETE"): Promise<void> {
    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes(`/api/recipe/${recipeId}/photo`) &&
                res.request().method() === method,
        ),
        page.getByRole("button", { name: "Save changes" }).click(),
    ]);

    expect(response.ok()).toBe(true);
    await expect(page).toHaveURL(/\/all-recipes$/);
}

test("should add a photo from the edit form and show it on the recipe page", async () => {
    await page.goto(`/change-recipe/${recipeId}`);
    await page.getByTestId("photo-input").setInputFiles(PHOTO);
    await expect(page.getByAltText("Photo of the recipe")).toBeVisible();

    await saveRecipeExpecting("PUT");

    await page.goto(`/recipe/${recipeId}`);
    const hero = page.getByRole("img", { name: recipeTitle });

    await expect(hero).toHaveAttribute("src", /\/api\/media\/.+-1200\.webp$/);
    // a blocked or broken image still has a src; only a decoded one has a width
    await expect
        .poll(() => hero.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
});

test("should show the photo on the recipe's card", async () => {
    await page.goto(`/all-recipes?q=${encodeURIComponent(recipeTitle)}`);
    const card = page.getByRole("article").filter({ hasText: recipeTitle });

    await expect(card.getByRole("presentation")).toHaveAttribute(
        "src",
        /-400\.webp$/,
    );
});

test("should remove the photo from the edit form", async () => {
    await page.goto(`/change-recipe/${recipeId}`);
    await page.getByRole("button", { name: "Remove photo" }).click();

    await saveRecipeExpecting("DELETE");

    await page.goto(`/recipe/${recipeId}`);
    await expect(page.getByRole("img", { name: recipeTitle })).toHaveCount(0);
});

test("should upload a profile photo and take it back off", async () => {
    await page.goto("/profile");
    await page.getByRole("button", { name: "Edit profile" }).click();
    await page.getByTestId("photo-input").setInputFiles(PHOTO);

    const [upload] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/me/avatar") &&
                res.request().method() === "PUT",
        ),
        page.getByRole("button", { name: "Save", exact: true }).click(),
    ]);

    expect(upload.ok()).toBe(true);
    await expect(
        page.getByRole("banner").getByRole("presentation"),
    ).toHaveAttribute("src", /\/api\/media\/.+-400\.webp$/);

    await page.getByRole("button", { name: "Edit profile" }).click();
    await page.getByRole("button", { name: "Remove photo" }).click();

    const [removal] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/me/avatar") &&
                res.request().method() === "DELETE",
        ),
        page.getByRole("button", { name: "Save", exact: true }).click(),
    ]);

    expect(removal.status()).toBe(204);
});
