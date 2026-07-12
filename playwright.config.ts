import { defineConfig, devices } from "@playwright/test";

// locally reuses an already-running `npm start`; CI always starts fresh
const FRONTEND_URL = "http://localhost:8080";
const BACKEND_HEALTH_URL = "http://localhost:3000/api/health";
const SERVER_START_TIMEOUT_MS = 120_000;

export default defineConfig({
    testDir: "./e2e",
    globalSetup: "./e2e/global-setup.ts",
    fullyParallel: false,
    workers: 1,
    retries: process.env.CI ? 1 : 0,
    forbidOnly: !!process.env.CI,
    reporter: [["list"]],
    use: {
        baseURL: FRONTEND_URL,
        trace: "retain-on-failure",
        screenshot: "only-on-failure",
    },
    projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
    webServer: [
        {
            command: "npm --prefix backend run dev",
            url: BACKEND_HEALTH_URL,
            reuseExistingServer: !process.env.CI,
            timeout: SERVER_START_TIMEOUT_MS,
        },
        {
            command: "npm --prefix frontend run dev",
            url: FRONTEND_URL,
            reuseExistingServer: !process.env.CI,
            timeout: SERVER_START_TIMEOUT_MS,
        },
    ],
});
