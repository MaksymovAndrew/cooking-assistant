import { expect, test } from "@playwright/test";

import { VIEWER_STORAGE_STATE } from "./sharedAccounts";

// the language switcher reloads the same page in another language and remembers the choice:
// on the device for a guest, and on the account as well once signed in
test("should switch a guest to Ukrainian and keep it for unprefixed links", async ({
    browser,
}) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto("/all-recipes");
    await page.getByRole("button", { name: "Language: English" }).click();
    await page.getByRole("menuitemradio", { name: "Українська" }).click();

    await expect(page).toHaveURL("/uk/all-recipes");
    await expect(page.locator("html")).toHaveAttribute("lang", "uk");
    await expect(
        page.getByRole("heading", { level: 1, name: "Усі рецепти" }),
    ).toBeVisible();

    await page.goto("/all-menus");
    await expect(page).toHaveURL("/uk/all-menus");

    await context.close();
});

test("should save a signed-in viewer's language to the account", async ({
    browser,
}) => {
    const context = await browser.newContext({
        storageState: VIEWER_STORAGE_STATE,
    });
    const page = await context.newPage();
    const main = page.locator("main");

    await page.goto("/settings");
    await main.getByRole("button", { name: "Language: English" }).click();
    await page.getByRole("menuitemradio", { name: "Polski" }).click();

    await expect(page).toHaveURL("/pl/settings");
    await expect(
        page.getByRole("heading", { level: 1, name: "Ustawienia" }),
    ).toBeVisible();

    const response = await page.request.get("/api/me");
    const me = (await response.json()) as { locale: string };

    expect(me.locale).toBe("pl");

    // back to English, so the shared account's emails stay in it for the other specs
    await main.getByRole("button", { name: "Język: Polski" }).click();
    await page.getByRole("menuitemradio", { name: "English" }).click();
    await expect(page).toHaveURL("/settings");

    await context.close();
});
