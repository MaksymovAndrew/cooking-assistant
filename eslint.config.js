// lints only the e2e suite + its config - backend/frontend keep their own configs
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const playwright = require("eslint-plugin-playwright");
const prettier = require("eslint-config-prettier");

module.exports = tseslint.config(
    {
        ignores: [
            "backend",
            "frontend",
            "node_modules",
            "test-results",
            "playwright-report",
            "coverage",
        ],
    },
    {
        files: ["playwright.config.ts", "e2e/**/*.ts"],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommendedTypeChecked,
        ],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
            },
        },
        plugins: {
            playwright,
        },
        rules: {
            ...playwright.configs["flat/recommended"].rules,
        },
    },
    prettier,
);
