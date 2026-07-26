import type { Locator, Page } from "@playwright/test";

// shared create-recipe/create-menu form flows - four specs need them, and the returned select-option texts feed the filter assertions in search-filter.spec.ts

// an ingredient option's accessible name is "<name> <unit>" (HighlightedMatch highlights the
// matched substring wherever it occurs, so a plain exact-text match on that substring still
// matches longer names built from it, e.g. "Tomato" inside "Tomato juice") - anchoring the query
// at the start and requiring a known unit word right after it picks out only the exact ingredient
const CATALOG_UNIT_WORDS = [
    "g",
    "kg",
    "ml",
    "l",
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

// types into a searchable-combobox picker, then clicks the resulting option
export async function selectFromPicker(
    page: Page,
    searchBox: Locator,
    query: string,
): Promise<void> {
    await searchBox.fill(query);

    const unitPattern = CATALOG_UNIT_WORDS.join("|");
    const exactIngredientOption = page.getByRole("button", {
        name: new RegExp(`^${escapeRegExp(query)}\\s(${unitPattern})\\b`, "i"),
    });

    // ingredient options resolve through the unit anchor above; the recipe picker (no unit
    // suffix) falls back to the original substring match, which stays unambiguous for the
    // uniquely-generated recipe titles these specs use
    if ((await exactIngredientOption.count()) === 1) {
        await exactIngredientOption.click();

        return;
    }

    await page.getByRole("button", { name: query }).click();
}

interface RecipeFormInput {
    title: string;
    description: string;
    ingredient: string;
    cookingHours: string;
    cookingMinutes: string;
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
    await page.getByLabel("Cooking time").fill(input.cookingHours);
    await page.getByLabel("Minutes").fill(input.cookingMinutes);
    await page
        .getByLabel("Recipe type")
        .selectOption({ index: input.typeIndex ?? 1 });
    const typeText = await readSelectedOptionText(page, "Recipe type");
    await selectFromPicker(
        page,
        page.getByLabel("Ingredients"),
        input.ingredient,
    );

    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/recipe") &&
                res.request().method() === "POST",
        ),
        page.getByRole("button", { name: "Create recipe" }).click(),
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

    return { menuId: String(body.menuId), categoryText };
}
