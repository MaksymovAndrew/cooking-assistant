import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import {
    deleteCalorieIntake,
    deleteRecipe,
    readCalorieGoal,
    setCalorieGoal,
} from "./api";
import { createRecipeViaForm } from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

test.describe.configure({ mode: "serial" });

// far above one recipe, so logging it never raises the once-a-day "over your goal" notice
const DAILY_GOAL = 5000;

interface LoggedIntake {
    id: number;
    calories: number;
}

let context: BrowserContext;
let page: Page;
let recipeId: string;
let recipeTitle: string;
let previousGoal: number | null;
let intake: LoggedIntake | undefined;

const kcal = (value: number) => new Intl.NumberFormat("en").format(value);

const openDietaryTab = async () => {
    await page.goto("/profile");
    await page.getByRole("tab", { name: "Dietary" }).click();
};

test.beforeAll(async ({ browser }) => {
    recipeTitle = `Calorie recipe ${Date.now().toString(36)}`;
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();
    previousGoal = await readCalorieGoal(context.request);

    ({ recipeId } = await createRecipeViaForm(page, {
        title: recipeTitle,
        description: "Created by calories e2e.",
        ingredient: "Potato",
        cookingHours: "0",
        cookingMinutes: "30",
    }));
});

test.afterAll(async () => {
    try {
        await deleteCalorieIntake(context.request, intake?.id);
        await setCalorieGoal(context.request, previousGoal);
        await deleteRecipe(context.request, recipeId);
    } finally {
        await context.close();
    }
});

test("should set a daily calorie goal and turn the tab into a dashboard", async () => {
    await openDietaryTab();
    await page.getByLabel("Daily goal (kcal)").fill(String(DAILY_GOAL));

    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().endsWith("/api/calorie-goal") &&
                res.request().method() === "PUT",
        ),
        page.getByRole("button", { name: "Save goal" }).click(),
    ]);

    expect(response.ok()).toBe(true);
    await expect(
        page.getByRole("heading", { name: "Today", exact: true }),
    ).toBeVisible();
    await expect(
        page.getByText(`of your ${kcal(DAILY_GOAL)} kcal goal`),
    ).toBeVisible();
});

test("should log an intake from the recipe page", async () => {
    await page.goto(`/recipe/${recipeId}`);
    await page.getByRole("button", { name: "Log intake" }).click();

    const dialog = page.getByRole("dialog");

    await expect(dialog.getByText(recipeTitle)).toBeVisible();

    const [response] = await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().endsWith("/api/calorie-intake") &&
                res.request().method() === "POST",
        ),
        dialog.getByRole("button", { name: "Log it" }).click(),
    ]);

    intake = (await response.json()) as LoggedIntake;
    expect(intake.calories).toBeGreaterThan(0);
    await expect(page.getByText("Logged to today's intake")).toBeVisible();
});

test("should count the intake in today's total, the journal and the history", async () => {
    const calories = intake?.calories ?? 0;
    const eaten = kcal(Math.round(calories));

    await openDietaryTab();
    await expect(
        page.getByText(
            `You've eaten ${eaten} kcal of your ${kcal(DAILY_GOAL)} kcal goal`,
        ),
    ).toBeVisible();

    const entry = page.getByRole("listitem").filter({ hasText: recipeTitle });

    await expect(entry).toBeVisible();
    await expect(
        entry.getByText(kcal(calories), { exact: true }),
    ).toBeVisible();
    await expect(
        page.getByRole("img", {
            name: new RegExp(`: ${kcal(calories)} kcal$`),
        }),
    ).toBeVisible();
});

test("should delete the intake from the journal", async () => {
    await openDietaryTab();

    const entry = page.getByRole("listitem").filter({ hasText: recipeTitle });

    await entry.getByRole("button", { name: "Delete entry" }).click();
    await page
        .getByRole("dialog")
        .getByRole("button", { name: "Delete" })
        .click();
    await expect(page.getByText("Entry deleted")).toBeVisible();
    await expect(entry).toBeHidden();
    await expect(
        page.getByText("You haven't logged anything today."),
    ).toBeVisible();
});
