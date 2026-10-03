import type { BrowserContext, Locator, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { removeFromPantry } from "./api";
import { selectFromPicker } from "./forms";
import { PRIMARY_STORAGE_STATE } from "./sharedAccounts";

test.describe.configure({ mode: "serial" });

// garlic keeps 60 days, so a clock this far ahead sees every lot bought today as expired
const DAYS_PAST_GARLIC_EXPIRY = 90;
const MS_PER_DAY = 86_400_000;

let context: BrowserContext;
let page: Page;

const garlicCard = () =>
    page.getByRole("article", { name: "Garlic", exact: true });

const lotWithQuantity = (history: Locator, quantity: string) =>
    history
        .getByRole("listitem")
        .filter({ has: page.getByText(quantity, { exact: true }) });

const savePantry = async (confirm: Locator) => {
    await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().endsWith("/api/user-ingredients") &&
                res.request().method() === "PUT",
        ),
        confirm.click(),
    ]);
};

const addGarlic = async (quantity: string) => {
    await page.goto("/ingredients");
    await page.getByRole("button", { name: "Add ingredient" }).click();
    await selectFromPicker(
        page,
        page.getByPlaceholder("Search ingredients…"),
        "Garlic",
    );
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("dialog").getByRole("spinbutton").fill(quantity);
    await savePantry(page.getByRole("button", { name: "Add to pantry" }));
};

const openHistory = async (): Promise<Locator> => {
    await page.goto("/ingredients");
    await garlicCard().getByRole("button", { name: "Details" }).click();

    const history = page.getByRole("dialog");

    await expect(
        history.getByRole("heading", { name: "Purchase history: Garlic" }),
    ).toBeVisible();

    return history;
};

test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ storageState: PRIMARY_STORAGE_STATE });
    page = await context.newPage();
});

test.afterAll(async () => {
    try {
        await removeFromPantry(context.request, "garlic");
    } finally {
        await context.close();
    }
});

test("should record each restock as its own purchase", async () => {
    await addGarlic("11");
    await expect(garlicCard().getByText(/^11\s*cloves$/)).toBeVisible();

    await garlicCard().getByRole("button", { name: "Buy more" }).click();

    const restock = page.getByRole("dialog");

    await restock.getByRole("spinbutton").fill("13");
    await savePantry(restock.getByRole("button", { name: "Add to pantry" }));
    await expect(garlicCard().getByText(/^24\s*cloves$/)).toBeVisible();

    const history = await openHistory();

    await expect(history.getByRole("listitem")).toHaveCount(2);
    await expect(lotWithQuantity(history, "11")).toBeVisible();
    await expect(lotWithQuantity(history, "13")).toBeVisible();
});

test("should change one purchase's quantity and keep it after a reload", async () => {
    const history = await openHistory();

    await lotWithQuantity(history, "11")
        .getByRole("button", { name: "Edit quantity" })
        .click();

    const field = history.getByLabel(/^Quantity of Garlic bought /);

    await field.fill("12");
    await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/user-ingredients/history/") &&
                res.request().method() === "PUT",
        ),
        field.press("Enter"),
    ]);
    await expect(field).toBeHidden();
    await expect(lotWithQuantity(history, "12")).toBeVisible();

    const reopened = await openHistory();

    await expect(lotWithQuantity(reopened, "12")).toBeVisible();
    await expect(lotWithQuantity(reopened, "13")).toBeVisible();
    await expect(lotWithQuantity(reopened, "11")).toBeHidden();
});

test("should delete one purchase and keep the other", async () => {
    const history = await openHistory();

    await Promise.all([
        page.waitForResponse(
            (res) =>
                res.url().includes("/api/user-ingredients/history/") &&
                res.request().method() === "DELETE",
        ),
        lotWithQuantity(history, "13")
            .getByRole("button", { name: "Delete purchase" })
            .click(),
    ]);
    await expect(lotWithQuantity(history, "13")).toBeHidden();
    await expect(history.getByRole("listitem")).toHaveCount(1);

    await page.goto("/ingredients");
    await expect(garlicCard().getByText(/^12\s*cloves$/)).toBeVisible();
});

test("should offer to throw out a purchase once it has expired", async ({
    browser,
}) => {
    // a fake clock belongs to the whole context, so the later day gets one of its own
    const laterContext = await browser.newContext({
        storageState: PRIMARY_STORAGE_STATE,
    });
    const laterPage = await laterContext.newPage();

    await laterPage.clock.setFixedTime(
        Date.now() + DAYS_PAST_GARLIC_EXPIRY * MS_PER_DAY,
    );
    await laterPage.goto("/ingredients");

    const notice = laterPage.getByRole("dialog");

    await expect(
        notice.getByRole("heading", { name: "Expired ingredients" }),
    ).toBeVisible();
    await expect(
        notice.getByText("1 purchase in your pantry has expired:"),
    ).toBeVisible();

    await Promise.all([
        laterPage.waitForResponse(
            (res) =>
                res.url().endsWith("/api/user-ingredients/history/discard") &&
                res.request().method() === "POST",
        ),
        notice.getByRole("button", { name: "Throw out expired" }).click(),
    ]);
    await expect(
        laterPage.getByText("Expired purchases thrown out"),
    ).toBeVisible();
    await expect(
        laterPage.getByRole("heading", { name: "Garlic", level: 3 }),
    ).toBeHidden();

    await laterContext.close();
});

test("should delete the ingredient from the pantry entirely", async () => {
    await addGarlic("5");
    await garlicCard().getByRole("button", { name: "Delete" }).click();

    const confirm = page.getByRole("dialog");

    await expect(
        confirm.getByText(/delete the ingredient "Garlic"/),
    ).toBeVisible();
    await confirm.getByRole("button", { name: "Delete" }).click();

    await expect(page.getByText("Ingredient deleted")).toBeVisible();
    await expect(garlicCard()).toBeHidden();
});
