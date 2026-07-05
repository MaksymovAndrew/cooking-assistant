import type { Page } from "@playwright/test";

// shared create-recipe/create-menu form flows - four specs need them, and the
// returned select-option texts feed the filter assertions in search-filter.spec.ts

interface RecipeFormInput {
    title: string;
    description: string;
    ingredient: string;
    cookingTime: string;
    servings: string;
    typeIndex?: number;
}

interface MenuFormInput {
    title: string;
    description: string;
    recipeTitle: string;
    categoryIndex?: number;
}

async function readSelectedOptionText(
    page: Page,
    label: string,
): Promise<string> {
    return page.getByLabel(label).evaluate((el) => {
        const select = el as HTMLSelectElement;

        return select.selectedOptions[0].textContent ?? "";
    });
}

export async function createRecipeViaForm(
    page: Page,
    input: RecipeFormInput,
): Promise<{ recipeId: string; typeText: string }> {
    await page.goto("/add-recipe");
    await page.getByLabel("Title").fill(input.title);
    await page.getByLabel("Description").fill(input.description);
    await page.getByLabel("Cooking Time").fill(input.cookingTime);
    await page
        .getByLabel("Recipe Type")
        .selectOption({ index: input.typeIndex ?? 1 });
    const typeText = await readSelectedOptionText(page, "Recipe Type");
    await page
        .getByRole("button", { name: input.ingredient, exact: true })
        .click();
    await page.getByLabel("Servings").fill(input.servings);

    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/recipe") &&
                res.request().method() === "POST",
        ),
        page.getByRole("button", { name: "Create Recipe" }).click(),
    ]);
    const body = (await response.json()) as { id: number };

    return { recipeId: String(body.id), typeText };
}

export async function createMenuViaForm(
    page: Page,
    input: MenuFormInput,
): Promise<{ menuId: string; categoryText: string }> {
    await page.goto("/add-menu");
    await page.getByLabel("Menu title").fill(input.title);
    await page.getByLabel("Menu description").fill(input.description);
    await page
        .getByLabel("Menu category")
        .selectOption({ index: input.categoryIndex ?? 1 });
    const categoryText = await readSelectedOptionText(page, "Menu category");
    await page
        .getByRole("button", { name: input.recipeTitle, exact: true })
        .click();

    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/create-menu") &&
                res.request().method() === "POST",
        ),
        page.getByRole("button", { name: "Create Menu" }).click(),
    ]);
    const body = (await response.json()) as { menuId: number };

    return { menuId: String(body.menuId), categoryText };
}
