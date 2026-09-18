import type { BrowserContext, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

// add, tick off, reorder and clear on the real API - the page's optimistic updates must agree with what the server stored
test.describe.configure({ mode: "serial" });

let context: BrowserContext;
let page: Page;

// unique per run, since the shared primary account keeps its list between runs
const suffix = Date.now().toString(36);
const FIRST = `Oat milk ${suffix}`;
const SECOND = `Rye bread ${suffix}`;

const section = (heading: string) =>
    page.getByRole("region", { name: heading });

test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();
});

test.afterAll(async () => {
    await context.close();
});

test("should add two items with a note", async () => {
    await page.goto("/shopping-list");

    await page.getByRole("textbox", { name: "Item" }).fill(FIRST);
    await page.getByRole("textbox", { name: "Note" }).fill("2 packs");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText(FIRST)).toBeVisible();

    await page.getByRole("textbox", { name: "Item" }).fill(SECOND);
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText(SECOND)).toBeVisible();
    await expect(page.getByText("2 packs")).toBeVisible();
});

test("should keep a new order after a reload", async () => {
    await page.getByRole("button", { name: `Move ${SECOND} up` }).click();
    await page.reload();

    const ownItems = section("To buy").getByRole("checkbox", {
        name: new RegExp(suffix),
    });

    await expect(ownItems.nth(0)).toHaveAccessibleName(new RegExp(SECOND));
    await expect(ownItems.nth(1)).toHaveAccessibleName(new RegExp(FIRST));
});

test("should tick an item off and clear it with the bought ones", async () => {
    await page.getByRole("checkbox", { name: FIRST }).check();
    await expect(section("Bought").getByText(FIRST)).toBeVisible();

    await page.reload();
    await expect(section("Bought").getByText(FIRST)).toBeVisible();

    await page.getByRole("button", { name: "Clear bought" }).click();
    await expect(page.getByText(FIRST)).toBeHidden();
    await expect(page.getByText(SECOND)).toBeVisible();

    await page.getByRole("button", { name: `Remove ${SECOND}` }).click();
    await expect(page.getByText(SECOND)).toBeHidden();
});
