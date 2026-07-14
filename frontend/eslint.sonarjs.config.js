import tseslint from "typescript-eslint";
import sonarjs from "eslint-plugin-sonarjs";

export default [
    {
        ignores: [
            "dist",
            "coverage",
            "eslint.config.js",
            "eslint.sonarjs.config.js",
        ],
    },
    sonarjs.configs.recommended,
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tseslint.parser,
        },
        rules: {
            "sonarjs/cognitive-complexity": "error",
            "sonarjs/no-duplicate-string": "error",
        },
    },
    {
        // test fixtures use fake credentials by design (mirrors backend/eslint.sonarjs.config.js)
        files: ["**/__tests__/**/*.{ts,tsx}", "**/*.test.{ts,tsx}"],
        rules: {
            "sonarjs/no-hardcoded-passwords": "off",
        },
    },
];
