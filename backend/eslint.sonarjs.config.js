const tseslint = require("typescript-eslint");
const sonarjs = require("eslint-plugin-sonarjs");

module.exports = [
    { ignores: ["node_modules", "coverage", "dist"] },
    sonarjs.configs.recommended,
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tseslint.parser,
        },
        rules: {
            "sonarjs/cognitive-complexity": "error",
            "sonarjs/no-duplicate-string": "error",
        },
    },
    {
        // test fixtures use fake credentials by design
        files: ["**/__tests__/**/*.ts", "**/*.test.ts", "src/test/**/*.ts"],
        rules: {
            "sonarjs/no-hardcoded-passwords": "off",
        },
    },
];
