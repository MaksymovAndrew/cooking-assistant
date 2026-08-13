import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { selectFromPicker } from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// purchase history and full ingredient removal - neither is touched by core-flows.spec.ts (quantity edit, different ingredient) or smoke.spec.ts (add only)
test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let page: Page;

test.beforeAll(async ({ browser }) => {
    // reuses the shared primary account (registered once in global-setup) instead of registering a fresh one here - keeps the suite's total auth calls low
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();

    await page.goto("/ingredients");
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await selectFromPicker(
        page,
        page.getByPlaceholder("Search ingredients..."),
        "Tomato",
    );
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Add to pantry" }).click();
    await expect(page.getByText("Ingredients saved")).toBeVisible();
});

test.afterAll(async () => {
    await context.close();
});

test("should open the purchase history modal and show the recorded purchase", async () => {
    await page.goto("/ingredients");
    // ingredient cards are a plain div grid (no list semantics) - scope to the card via its own heading so Details/Delete aren't ambiguous between ingredients from other specs sharing this account's pantry
    const tomatoCard = page
        .getByRole("heading", { name: "Tomato", level: 3 })
        .locator("../..");
    await tomatoCard.getByRole("button", { name: "Details" }).click();

    await expect(
        page.getByRole("heading", { name: "Purchase History: Tomato" }),
    ).toBeVisible();
    await expect(page.getByText("No purchase history available.")).toBeHidden();

    await page.getByRole("button", { name: "Close" }).click();
    await expect(
        page.getByRole("heading", { name: "Purchase History: Tomato" }),
    ).toBeHidden();
});

test("should delete the ingredient from the pantry entirely", async () => {
    await page.goto("/ingredients");
    const tomatoCard = page
        .getByRole("heading", { name: "Tomato", level: 3 })
        .locator("../..");
    await tomatoCard.getByRole("button", { name: "Delete" }).click();

    await expect(
        page.getByText(/delete the ingredient "Tomato"/),
    ).toBeVisible();
    await page.getByRole("button", { name: "Confirm" }).click();

    await expect(page.getByText("Ingredient deleted")).toBeVisible();
    await expect(page.getByText("Tomato")).toBeHidden();
});
