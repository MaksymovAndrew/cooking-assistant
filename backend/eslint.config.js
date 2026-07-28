const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const promise = require("eslint-plugin-promise");
const jest = require("eslint-plugin-jest");
const deMorgan = require("eslint-plugin-de-morgan");
const importPlugin = require("eslint-plugin-import");
const simpleImportSort = require("eslint-plugin-simple-import-sort");
const boundaries = require("eslint-plugin-boundaries");
const prettier = require("eslint-config-prettier");

module.exports = tseslint.config(
    { ignores: ["node_modules", "coverage", "src/types/*.d.ts"] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
        ],
        files: ["**/*.ts"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: __dirname,
            },
        },
        rules: {
            eqeqeq: ["error", "always", { null: "ignore" }],
            "@typescript-eslint/restrict-template-expressions": [
                "error",
                { allowNumber: true },
            ],
            "no-shadow": "off",
            "@typescript-eslint/no-shadow": "error",
            "no-param-reassign": "error",
            "consistent-return": "error",
            "no-nested-ternary": "error",
            curly: ["error", "all"],
            "no-var": "error",
            "prefer-const": "error",
            "no-console": "error",
            "no-throw-literal": "error",
            "@typescript-eslint/switch-exhaustiveness-check": "error",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", ignoreRestSiblings: true },
            ],
            "@typescript-eslint/consistent-type-imports": "error",
            "@typescript-eslint/naming-convention": [
                "error",
                { selector: "typeLike", format: ["PascalCase"] },
            ],
            "padding-line-between-statements": [
                "error",
                { blankLine: "always", prev: "*", next: "return" },
                {
                    blankLine: "always",
                    prev: ["const", "let", "var"],
                    next: "*",
                },
                {
                    blankLine: "any",
                    prev: ["const", "let", "var"],
                    next: ["const", "let", "var"],
                },
            ],
        },
    },
    deMorgan.configs.recommended,
    promise.configs["flat/recommended"],
    {
        ...importPlugin.flatConfigs.recommended,
        files: ["**/*.ts"],
        rules: {
            ...importPlugin.flatConfigs.recommended.rules,
            "import/order": "off",
        },
    },
    {
        files: ["**/*.ts"],
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: "./tsconfig.json",
                },
            },
        },
        rules: {
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        ["^\\u0000"],
                        [
                            "^(?!(?:domain|application|infrastructure|controller|routes|middleware|config|constants|test)/)@?\\w",
                        ],
                        ["^(?:config|constants|domain)/"],
                        ["^application/"],
                        ["^infrastructure/"],
                        ["^(?:controller|routes|middleware)/"],
                        ["^test/"],
                        ["^\\."],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",
            "import/no-unresolved": "error",
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            regex: "^\\.\\./",
                            message:
                                "Use bare path aliases (domain/*, application/*, ...) instead of ../ parent imports.",
                        },
                    ],
                },
            ],
            "no-restricted-syntax": [
                "error",
                {
                    selector:
                        "BinaryExpression[operator='==='][right.type='Identifier'][right.name='undefined']",
                    message:
                        "Prefer null. Use === null instead of === undefined.",
                },
                {
                    selector:
                        "BinaryExpression[operator='!=='][right.type='Identifier'][right.name='undefined']",
                    message:
                        "Prefer null. Use !== null instead of !== undefined.",
                },
            ],
            "import/no-cycle": ["error", { maxDepth: 10 }],
            "import/no-extraneous-dependencies": [
                "error",
                {
                    devDependencies: [
                        "**/*.test.ts",
                        "**/__tests__/**",
                        "src/test/**",
                        "**/*.config.{js,ts}",
                        "src/scripts/**",
                    ],
                },
            ],
        },
    },
    {
        // magic numbers belong in named constants (constants/ and config/ are the
        // sanctioned homes); HTTP status codes are self-documenting and allowed;
        // scripts/ holds seed data where inline numbers are the content itself
        files: ["src/**/*.ts"],
        ignores: [
            "src/constants/**",
            "src/config/**",
            "src/scripts/**",
            "**/__tests__/**",
            "src/test/**",
        ],
        rules: {
            "@typescript-eslint/no-magic-numbers": [
                "error",
                {
                    ignore: [
                        -1, 0, 1, 2, 200, 201, 204, 400, 401, 403, 404, 409,
                        429, 500,
                    ],
                    ignoreDefaultValues: true,
                    ignoreClassFieldInitialValues: true,
                    ignoreEnums: true,
                    ignoreNumericLiteralTypes: true,
                    ignoreReadonlyClassProperties: true,
                    ignoreTypeIndexes: true,
                    detectObjects: false,
                },
            ],
        },
    },
    {
        files: ["**/*.ts"],
        ignores: ["**/__tests__/**/*.ts", "src/test/**/*.ts"],
        rules: {
            "max-lines": [
                "error",
                { max: 150, skipBlankLines: true, skipComments: true },
            ],
            "max-lines-per-function": [
                "error",
                { max: 150, skipBlankLines: true, skipComments: true },
            ],
            complexity: ["error", 15],
        },
    },
    {
        files: ["src/**/*.ts"],
        plugins: {
            local: {
                rules: {
                    "no-complex-condition": {
                        meta: {
                            type: "suggestion",
                            messages: {
                                complex:
                                    "Condition has 3+ operands: extract it into a named constant.",
                            },
                        },
                        create(context) {
                            const count = (n) =>
                                n && n.type === "LogicalExpression"
                                    ? count(n.left) + count(n.right)
                                    : 1;
                            const check = (t) => {
                                if (
                                    t &&
                                    t.type === "LogicalExpression" &&
                                    count(t) >= 3
                                ) {
                                    context.report({
                                        node: t,
                                        messageId: "complex",
                                    });
                                }
                            };

                            return {
                                IfStatement: (n) => check(n.test),
                                ConditionalExpression: (n) => check(n.test),
                                WhileStatement: (n) => check(n.test),
                                DoWhileStatement: (n) => check(n.test),
                                ForStatement: (n) => check(n.test),
                            };
                        },
                    },
                },
            },
        },
        rules: { "local/no-complex-condition": "error" },
    },
    {
        files: ["src/**/*.ts"],
        plugins: { boundaries },
        settings: {
            "boundaries/elements": [
                { type: "config", pattern: "src/config/**" },
                { type: "constants", pattern: "src/constants/**" },
                { type: "domain", pattern: "src/domain/**" },
                { type: "application", pattern: "src/application/**" },
                { type: "infrastructure", pattern: "src/infrastructure/**" },
                { type: "controller", pattern: "src/controller/**" },
                { type: "routes", pattern: "src/routes/**" },
                { type: "middleware", pattern: "src/middleware/**" },
            ],
        },
        rules: {
            "boundaries/dependencies": [
                "error",
                {
                    checkAllOrigins: true,
                    default: "allow",
                    rules: [
                        {
                            from: [{ type: "domain" }],
                            disallow: {
                                to: [
                                    { type: "application" },
                                    { type: "infrastructure" },
                                    { type: "controller" },
                                    { type: "routes" },
                                    { type: "middleware" },
                                ],
                            },
                            message: "Domain must not import outer layers.",
                        },
                        {
                            from: [{ type: "application" }],
                            disallow: {
                                to: [
                                    { type: "infrastructure" },
                                    { type: "controller" },
                                    { type: "routes" },
                                ],
                            },
                            message:
                                "Application must not import infrastructure or HTTP layers.",
                        },
                        {
                            from: [{ type: "controller" }],
                            disallow: { to: [{ type: "infrastructure" }] },
                            message:
                                "Controllers must not import infrastructure directly; use use-cases.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["**/*.test.ts"],
        ...jest.configs["flat/recommended"],
        rules: {
            ...jest.configs["flat/recommended"].rules,
            "@typescript-eslint/unbound-method": "off",
        },
    },
    {
        files: [
            "eslint.config.js",
            "eslint.sonarjs.config.js",
            "jest.config.js",
        ],
        languageOptions: {
            globals: {
                require: "readonly",
                module: "readonly",
                __dirname: "readonly",
            },
        },
        rules: {
            "@typescript-eslint/no-require-imports": "off",
        },
    },
    {
        files: ["**/jest.setup.ts"],
        rules: {
            "@typescript-eslint/no-namespace": "off",
        },
    },
    {
        files: ["**/asyncHandler.ts"],
        rules: {
            "promise/no-callback-in-promise": "off",
        },
    },
    prettier,
);
