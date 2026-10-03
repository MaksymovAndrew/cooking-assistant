import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";

// typing before hydration is lost; the submit button enables itself only once hydrated
export async function gotoPublicForm(page: Page, path: string): Promise<void> {
    await page.goto(path);
    await expect(page.locator("button[type=submit]").first()).toBeEnabled();
}

// option names read "<name> <unit>" (en common.json "units"), so "Tomato" never picks "Tomato juice"
const CATALOG_UNITS = [
    "g",
    "kg",
    "ml",
    "L",
    "tsp",
    "tbsp",
    "piece",
    "clove",
    "bunch",
    "sprig",
    "slice",
    "head",
    "can",
    "package",
];

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function selectFromPicker(
    page: Page,
    searchBox: Locator,
    query: string,
): Promise<void> {
    await searchBox.fill(query);

    const unitPattern = CATALOG_UNITS.join("|");
    const exactIngredientOption = page.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(query)}\\s(${unitPattern})\\b`, "i"),
    });
    const substringOption = page.getByRole("button", { name: query });

    // the search is debounced, so wait for an option to render before counting
    await exactIngredientOption.or(substringOption).first().waitFor();

    // recipe options have no unit, so they take the substring match - titles are unique per run
    if ((await exactIngredientOption.count()) === 1) {
        await exactIngredientOption.click();

        return;
    }

    await substringOption.click();
}

interface RecipeFormInput {
    title: string;
    description: string;
    ingredient: string;
    cookingHours: string;
    cookingMinutes: string;
    // left out, the form keeps the page's own language
    language?: string;
}

interface MenuFormInput {
    title: string;
    description: string;
    recipeTitle: string;
    language?: string;
}

export async function createRecipeViaForm(
    page: Page,
    input: RecipeFormInput,
): Promise<{ recipeId: string }> {
    await page.goto("/add-recipe");
    await page.getByLabel("Title").fill(input.title);
    await page.getByLabel("Description").fill(input.description);
    await page.getByLabel("Cooking time").fill(input.cookingHours);
    await page.getByLabel("Minutes").fill(input.cookingMinutes);
    await page.getByLabel("Recipe type").selectOption({ index: 1 });
    if (input.language) {
        await page.getByLabel("Recipe language").selectOption(input.language);
    }
    await selectFromPicker(
        page,
        page.getByLabel("Ingredients"),
        input.ingredient,
    );

    // the id comes from the create response, not page markup, so it survives page changes
    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/recipe") &&
                res.request().method() === "POST",
        ),
        page.getByRole("button", { name: "Create recipe" }).click(),
    ]);
    const body = (await response.json()) as { id: number };

    return { recipeId: String(body.id) };
}

export async function createMenuViaForm(
    page: Page,
    input: MenuFormInput,
): Promise<{ menuId: string }> {
    await page.goto("/add-menu");
    await page.getByLabel("Menu title").fill(input.title);
    await page.getByLabel("Menu description").fill(input.description);
    await page.getByLabel("Menu category").selectOption({ index: 1 });
    if (input.language) {
        await page.getByLabel("Menu language").selectOption(input.language);
    }
    await selectFromPicker(page, page.getByLabel("Recipes"), input.recipeTitle);

    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/create-menu") &&
                res.request().method() === "POST",
        ),
        page.getByRole("button", { name: "Create menu" }).click(),
    ]);
    const body = (await response.json()) as { menuId: number };

    return { menuId: String(body.menuId) };
}
