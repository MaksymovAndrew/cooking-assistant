import type { APIRequestContext, APIResponse } from "@playwright/test";
import { expect } from "@playwright/test";

// cleanup goes through the API: a UI teardown fails with its page and leaves the shared accounts dirty

interface PantryRow {
    ingredient_id: number;
    ingredient_slug: string;
}

interface ShoppingListRow {
    id: number;
    name: string;
    ingredient_slug: string | null;
}

interface DietPreferences {
    allergens: string[];
    ingredient_ids: number[];
}

const NOT_FOUND = 404;

// a record the spec already deleted through the UI answers 404, which is the state cleanup wants
function expectGoneOrDeleted(response: APIResponse): void {
    expect(
        response.ok() || response.status() === NOT_FOUND,
        `${response.url()} answered ${response.status()}`,
    ).toBe(true);
}

function expectOk(response: APIResponse): void {
    expect(
        response.ok(),
        `${response.url()} answered ${response.status()}`,
    ).toBe(true);
}

export async function readJson<T>(response: APIResponse): Promise<T> {
    expectOk(response);

    return (await response.json()) as T;
}

export async function deleteRecipe(
    request: APIRequestContext,
    recipeId: string | undefined,
): Promise<void> {
    if (recipeId) {
        expectGoneOrDeleted(await request.delete(`/api/recipe/${recipeId}`));
    }
}

export async function deleteMenu(
    request: APIRequestContext,
    menuId: string | undefined,
): Promise<void> {
    if (menuId) {
        expectGoneOrDeleted(await request.delete(`/api/menu/${menuId}`));
    }
}

export async function removeFromPantry(
    request: APIRequestContext,
    slug: string,
): Promise<void> {
    const rows = await readJson<PantryRow[]>(
        await request.get("/api/user-ingredients"),
    );

    for (const row of rows.filter((item) => item.ingredient_slug === slug)) {
        expectGoneOrDeleted(
            await request.delete(`/api/user-ingredients/${row.ingredient_id}`),
        );
    }
}

async function removeShoppingItems(
    request: APIRequestContext,
    matches: (item: ShoppingListRow) => boolean,
): Promise<void> {
    const items = await readJson<ShoppingListRow[]>(
        await request.get("/api/shopping-list"),
    );

    for (const item of items.filter(matches)) {
        expectGoneOrDeleted(
            await request.delete(`/api/shopping-list/${item.id}`),
        );
    }
}

export async function removeFromShoppingList(
    request: APIRequestContext,
    slug: string,
): Promise<void> {
    await removeShoppingItems(request, (item) => item.ingredient_slug === slug);
}

// a free-text item has no slug to find it by
export async function removeShoppingItemsNamed(
    request: APIRequestContext,
    names: string[],
): Promise<void> {
    await removeShoppingItems(request, (item) => names.includes(item.name));
}

export async function deleteTag(
    request: APIRequestContext,
    tagId: number | undefined,
): Promise<void> {
    if (tagId) {
        expectGoneOrDeleted(await request.delete(`/api/tags/${tagId}`));
    }
}

export async function clearDietPreferences(
    request: APIRequestContext,
): Promise<void> {
    const preferences = await readJson<DietPreferences>(
        await request.get("/api/diet-preferences"),
    );

    for (const slug of preferences.allergens) {
        expectGoneOrDeleted(
            await request.delete(`/api/diet-preferences/allergens/${slug}`),
        );
    }

    for (const id of preferences.ingredient_ids) {
        expectGoneOrDeleted(
            await request.delete(`/api/ingredient/${id}/avoid`),
        );
    }
}

export async function setAccountLocale(
    request: APIRequestContext,
    locale: string,
): Promise<void> {
    expectOk(await request.put("/api/me/locale", { data: { locale } }));
}

export async function readCalorieGoal(
    request: APIRequestContext,
): Promise<number | null> {
    const me = await readJson<{ calorie_goal: number | null }>(
        await request.get("/api/me"),
    );

    return me.calorie_goal;
}

export async function setCalorieGoal(
    request: APIRequestContext,
    calorieGoal: number | null,
): Promise<void> {
    expectOk(
        await request.put("/api/calorie-goal", {
            data: { calorie_goal: calorieGoal },
        }),
    );
}

export async function deleteCalorieIntake(
    request: APIRequestContext,
    intakeId: number | undefined,
): Promise<void> {
    if (intakeId) {
        expectGoneOrDeleted(
            await request.delete(`/api/calorie-intake/${intakeId}`),
        );
    }
}

// drops only the uploaded photo; the preset avatar stays
export async function removeAvatarPhoto(
    request: APIRequestContext,
): Promise<void> {
    expectGoneOrDeleted(await request.delete("/api/me/avatar"));
}
