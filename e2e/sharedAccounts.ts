import { readFileSync } from "node:fs";
import path from "node:path";

// single source of truth for the .auth paths and account shapes shared between global-setup (which writes them once per run) and the specs (which read them)
export const AUTH_DIR = path.join(__dirname, ".auth");
export const PRIMARY_STORAGE_STATE = path.join(AUTH_DIR, "primary.json");
export const VIEWER_STORAGE_STATE = path.join(AUTH_DIR, "viewer.json");
export const ACCOUNTS_FILE = path.join(AUTH_DIR, "accounts.json");

export interface SharedAccount {
    login: string;
    name: string;
}

export interface SharedAccounts {
    runId: string;
    primary: SharedAccount;
    viewer: SharedAccount;
}

export function readSharedAccounts(): SharedAccounts {
    return JSON.parse(readFileSync(ACCOUNTS_FILE, "utf8")) as SharedAccounts;
}
