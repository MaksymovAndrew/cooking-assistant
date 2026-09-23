import type { Browser, Page } from "@playwright/test";
import { expect, test } from "@playwright/test";

import { gotoPublicForm } from "./forms";

// registers its own account: the password change it makes would end the shared accounts' sessions
// and take every other spec down with them
test.describe.configure({ mode: "serial" });

const NAME = "Revoke";

let pageA: Page;
let pageB: Page;
let login: string;
let password: string;
let newPassword: string;

const logIn = async (page: Page, secret: string) => {
    await gotoPublicForm(page, "/login");
    await page.getByLabel("Username", { exact: true }).fill(login);
    await page.getByLabel("Password", { exact: true }).fill(secret);
    await page.getByRole("button", { name: "Log In" }).click();
};

const openBrowser = async (browser: Browser) =>
    (await browser.newContext()).newPage();

test.beforeAll(async ({ browser }) => {
    const runId = Date.now().toString(36);

    login = `e2e-rv-${runId}`;
    // throwaway per-run passwords; both still satisfy the real password policy
    password = `${login}-Aa1!`;
    newPassword = `${login}-Bb2!`;
    pageA = await openBrowser(browser);
    pageB = await openBrowser(browser);
});

test.afterAll(async () => {
    await pageA.context().close();
    await pageB.context().close();
});

test("should keep one account signed in on two browsers at once", async () => {
    await gotoPublicForm(pageA, "/registration");
    await pageA.getByLabel("Name:", { exact: true }).fill(NAME);
    await pageA.getByLabel("Surname:", { exact: true }).fill("Session");
    await pageA.getByLabel("Username", { exact: true }).fill(login);
    await pageA
        .getByLabel("Email", { exact: true })
        .fill(`${login}@example.com`);
    await pageA.getByLabel("Password", { exact: true }).fill(password);
    await pageA.getByRole("button", { name: "Register" }).click();
    await expect(pageA).toHaveURL("/");

    await logIn(pageB, password);
    await expect(pageB).toHaveURL("/");
    await expect(pageB.getByText(`Welcome back, ${NAME}`)).toBeVisible();
});

test("should keep the browser that changed the password signed in", async () => {
    await pageA.goto("/settings");
    await pageA.getByRole("button", { name: "Change…" }).click();
    await pageA.getByLabel("Current password", { exact: true }).fill(password);
    await pageA.getByLabel("New password", { exact: true }).fill(newPassword);
    await pageA
        .getByLabel("Confirm new password", { exact: true })
        .fill(newPassword);
    await pageA.getByRole("button", { name: "Save password" }).click();
    await expect(pageA.getByText("Password changed")).toBeVisible();

    await pageA.goto("/profile");
    await expect(pageA).toHaveURL("/profile");
    await expect(pageA.getByText(`${NAME} Session`)).toBeVisible();
});

test("should sign the other browser out once the password has changed", async () => {
    await pageB.goto("/profile");
    await expect(pageB).toHaveURL(/\/login/);
});

test("should refuse the old password and accept the new one", async () => {
    await logIn(pageB, password);
    await expect(pageB).toHaveURL(/\/login/);

    // back to the page the ended session was turned away from
    await logIn(pageB, newPassword);
    await expect(pageB).toHaveURL("/profile");
});
