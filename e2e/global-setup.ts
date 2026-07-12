import { mkdirSync, writeFileSync } from "node:fs";
import { request } from "@playwright/test";

import type { SharedAccount, SharedAccounts } from "./sharedAccounts";
import {
    ACCOUNTS_FILE,
    AUTH_DIR,
    PRIMARY_STORAGE_STATE,
    VIEWER_STORAGE_STATE,
} from "./sharedAccounts";

// registers two shared accounts ONCE per suite run (not once per spec file) so the full suite stays well under the login/register rate limiter - specs read accounts.json for the run-unique login/name and reuse the saved cookie via storageState
const BACKEND_URL = "http://localhost:3000";

async function createAccount(
    storagePath: string,
    account: SharedAccount,
): Promise<void> {
    const { login, name } = account;
    const context = await request.newContext();

    const registerResponse = await context.post(`${BACKEND_URL}/api/register`, {
        data: { name, surname: "E2E", login, password: login },
    });
    if (!registerResponse.ok()) {
        throw new Error(
            `global-setup: register failed for "${login}" (${registerResponse.status()}): ${await registerResponse.text()}`,
        );
    }

    const loginResponse = await context.post(`${BACKEND_URL}/api/login`, {
        data: { login, password: login },
    });
    if (!loginResponse.ok()) {
        throw new Error(
            `global-setup: login failed for "${login}" (${loginResponse.status()}): ${await loginResponse.text()}`,
        );
    }

    await context.storageState({ path: storagePath });
    await context.dispose();
}

export default async function globalSetup(): Promise<void> {
    mkdirSync(AUTH_DIR, { recursive: true });

    const runId = Date.now().toString(36);
    const accounts: SharedAccounts = {
        runId,
        primary: { login: `e2e-primary-${runId}`, name: "Primary" },
        viewer: { login: `e2e-viewer-${runId}`, name: "Viewer" },
    };

    await createAccount(PRIMARY_STORAGE_STATE, accounts.primary);
    await createAccount(VIEWER_STORAGE_STATE, accounts.viewer);

    writeFileSync(ACCOUNTS_FILE, JSON.stringify(accounts));
}
