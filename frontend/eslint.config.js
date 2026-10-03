import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import deMorgan from "eslint-plugin-de-morgan";
import importPlugin from "eslint-plugin-import";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import testingLibrary from "eslint-plugin-testing-library";
import i18next from "eslint-plugin-i18next";
import boundaries from "eslint-plugin-boundaries";
import prettier from "eslint-config-prettier";
import tseslint from "typescript-eslint";

// shared by both no-restricted-syntax blocks: a later block for the same files replaces the rule
const preferNullRestrictions = [
    {
        selector:
            "BinaryExpression[operator='==='][right.type='Identifier'][right.name='undefined']",
        message: "Prefer null. Use === null instead of === undefined.",
    },
    {
        selector:
            "BinaryExpression[operator='!=='][right.type='Identifier'][right.name='undefined']",
        message: "Prefer null. Use !== null instead of !== undefined.",
    },
];

// repeated in every no-restricted-imports block: a later block replaces the rule outright
const parentImportRestriction = {
    regex: "^\.\./",
    message:
        "Use bare path aliases (api/*, components/*, ...) instead of ../ parent imports.",
};

export default tseslint.config(
    { ignores: ["dist", "coverage", ".next", "next-env.d.ts"] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.strictTypeChecked,
            ...tseslint.configs.stylisticTypeChecked,
        ],
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                // not projectService: the root tsconfig.json is Next's and covers app code only
                project: [
                    "./tsconfig.app.json",
                    "./tsconfig.node.json",
                    "./tsconfig.test.json",
                ],
                tsconfigRootDir: import.meta.dirname,
            },
        },
        plugins: {
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "error",
                { allowConstantExport: true },
            ],
            "react-hooks/exhaustive-deps": "error",
            eqeqeq: ["error", "always"],
            "no-var": "error",
            "prefer-const": "error",
            "no-console": "error",
            "@typescript-eslint/switch-exhaustiveness-check": "error",
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
    jsxA11y.flatConfigs.recommended,
    deMorgan.configs.recommended,
    {
        ...importPlugin.flatConfigs.recommended,
        files: ["**/*.{ts,tsx}"],
        rules: {
            ...importPlugin.flatConfigs.recommended.rules,
            "import/order": "off", // handed off to simple-import-sort
        },
    },
    {
        files: ["**/*.{ts,tsx}"],
        plugins: {
            "simple-import-sort": simpleImportSort,
        },
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: "./tsconfig.app.json",
                },
            },
        },
        rules: {
            "simple-import-sort/imports": [
                "error",
                {
                    groups: [
                        // side effects (CSS, polyfills, setup files)
                        ["^\\u0000"],
                        // external packages - starts with letter/@, but not our bare aliases
                        [
                            "^(?!(?:api|app|assets|components|config|constants|hooks|i18n|redux|test|types|utils)/)@?\\w",
                        ],
                        ["^(?:config|constants|types)/"],
                        ["^api/"],
                        ["^redux/"],
                        ["^hooks/"],
                        ["^(?:components|assets|i18n)/"],
                        ["^utils/"],
                        ["^(?:app|test)/"],
                        ["^\\."],
                    ],
                },
            ],
            "simple-import-sort/exports": "error",
            "import/no-unresolved": "error",
            // by syntax: import/no-relative-parent-imports wrongly flags tests importing their subject by alias
            "no-restricted-imports": [
                "error",
                {
                    patterns: [
                        {
                            regex: "^\\.\\./",
                            message:
                                "Use bare path aliases (api/*, components/*, ...) instead of ../ parent imports.",
                        },
                    ],
                },
            ],
            "no-restricted-syntax": ["error", ...preferNullRestrictions],
            "import/no-cycle": ["error", { maxDepth: 10 }],
            "import/no-extraneous-dependencies": [
                "error",
                {
                    devDependencies: [
                        "**/*.test.{ts,tsx}",
                        "**/__tests__/**",
                        "src/test/**",
                        "**/*.config.{ts,js,cjs}",
                    ],
                },
            ],
        },
    },
    {
        files: ["src/**/*.{ts,tsx}"],
        ignores: [
            "src/api/endpoints.ts",
            "src/constants/routes.ts",
            "**/__tests__/**",
            "src/test/**",
        ],
        rules: {
            "no-restricted-syntax": [
                "error",
                ...preferNullRestrictions,
                {
                    selector: "Literal[value=/^\\u002Fapi\\u002F/]",
                    message:
                        "Hardcoded API path. Add it to API_ROUTES in api/endpoints.ts and import it.",
                },
                {
                    selector: "TemplateElement[value.raw=/^\\u002Fapi\\u002F/]",
                    message:
                        "Hardcoded API path. Add a builder to API_ROUTES in api/endpoints.ts and import it.",
                },
                {
                    selector:
                        "JSXAttribute[name.name='href'] Literal[value=/^\\u002F/]",
                    message:
                        "Hardcoded route path. Use ROUTES from constants/routes.ts.",
                },
                {
                    selector:
                        "CallExpression[callee.object.name='router'] Literal[value=/^\\u002F/]",
                    message:
                        "Hardcoded route path. Use ROUTES from constants/routes.ts.",
                },
            ],
        },
    },
    {
        // a bare next/link still works, just silently without the unsaved-changes guard
        files: ["src/**/*.{ts,tsx}"],
        ignores: [
            "src/components/ui/Link/Link.tsx",
            "src/hooks/useAppRouter.ts",
            "src/test/**",
        ],
        rules: {
            "no-restricted-imports": [
                "error",
                {
                    patterns: [parentImportRestriction],
                    paths: [
                        {
                            name: "next/link",
                            message:
                                "Use the Link from components/ui/Link - it goes through the navigation blocker.",
                        },
                        {
                            name: "next/navigation",
                            importNames: ["useRouter"],
                            message:
                                "Use useAppRouter from hooks/useAppRouter - it goes through the navigation blocker.",
                        },
                    ],
                },
            ],
        },
    },
    {
        // .tsx is exempt: presentational sizes in JSX props are not logic
        files: ["src/**/*.ts"],
        ignores: [
            "src/constants/**",
            "src/config/**",
            "**/__tests__/**",
            "src/test/**",
        ],
        rules: {
            "@typescript-eslint/no-magic-numbers": [
                "error",
                {
                    ignore: [-1, 0, 1, 2],
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
        files: ["**/*.{ts,tsx}"],
        ignores: ["**/__tests__/**/*.{ts,tsx}"],
        rules: {
            // a hard ceiling only - the working norm is 100 lines, see "File size and where code lives" in AGENTS.md
            "max-lines": [
                "error",
                { max: 250, skipBlankLines: true, skipComments: true },
            ],
            "max-lines-per-function": [
                "error",
                { max: 250, skipBlankLines: true, skipComments: true },
            ],
            complexity: ["error", 15],
        },
    },
    {
        // route files export metadata beside the component; Fast Refresh skips server components
        files: ["src/app/**/*.{ts,tsx}"],
        rules: { "react-refresh/only-export-components": "off" },
    },
    {
        files: ["src/**/*.{ts,tsx}"],
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
                                )
                                    context.report({
                                        node: t,
                                        messageId: "complex",
                                    });
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
        files: ["src/**/*.{ts,tsx}"],
        plugins: { boundaries },
        settings: {
            "boundaries/elements": [
                { type: "config", pattern: "src/config/*" },
                { type: "types", pattern: "src/types/*" },
                { type: "constants", pattern: "src/constants/*" },
                { type: "i18n", pattern: "src/i18n/**" },
                { type: "utils", pattern: "src/utils/**" },
                { type: "api", pattern: "src/api/**" },
                { type: "redux", pattern: "src/redux/**" },
                { type: "hooks", pattern: "src/hooks/*" },
                { type: "components", pattern: "src/components/**" },
                { type: "app", pattern: "src/app/**" },
            ],
        },
        rules: {
            "boundaries/dependencies": [
                "error",
                {
                    checkAllOrigins: true,
                    default: "allow",
                    policies: [
                        {
                            from: { element: { type: "components" } },
                            disallow: {
                                to: {
                                    element: { types: ["app"] },
                                },
                            },
                            message: "Components must not import pages.",
                        },
                        {
                            from: {
                                element: {
                                    types: {
                                        anyOf: [
                                            "app",
                                            "components",
                                            "hooks",
                                            "utils",
                                            "redux",
                                        ],
                                    },
                                },
                            },
                            disallow: {
                                to: {
                                    module: {
                                        origin: "external",
                                        source: "axios",
                                    },
                                },
                            },
                            message:
                                "Use the api layer instead of importing axios directly.",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: [
            "src/app/**/*.{ts,tsx}",
            "src/components/**/*.{ts,tsx}",
            "src/hooks/**/*.{ts,tsx}",
            "src/i18n/**/*.{ts,tsx}",
        ],
        ignores: ["**/__tests__/**"],
        plugins: { i18next },
        rules: {
            "i18next/no-literal-string": [
                "error",
                {
                    mode: "jsx-only",
                    "jsx-attributes": {
                        // plugin defaults plus value (<option> sort keys) and idPrefix (id/htmlFor pairs)
                        exclude: [
                            "className",
                            "styleName",
                            "style",
                            "type",
                            "key",
                            "id",
                            "width",
                            "height",
                            "value",
                            "idPrefix",
                        ],
                    },
                },
            ],
        },
    },
    {
        files: [
            "src/components/ui/**/*.{ts,tsx}",
            "src/components/layout/**/*.{ts,tsx}",
            "src/utils/**/*.{ts,tsx}",
        ],
        rules: {
            "import/no-default-export": "error",
        },
    },
    {
        files: ["src/config/logger.ts"],
        rules: {
            "no-console": "off",
        },
    },
    {
        // jest.fn() mocks have no `this` binding, so unbound-method is a false positive in test code
        files: [
            "**/__tests__/**/*.{ts,tsx}",
            "src/test/**/*.{ts,tsx}",
            "src/**/__mocks__/**/*.{ts,tsx}",
        ],
        rules: {
            "@typescript-eslint/unbound-method": "off",
        },
    },
    {
        ...testingLibrary.configs["flat/react"],
        files: ["**/__tests__/**/*.{ts,tsx}", "src/test/**/*.{ts,tsx}"],
    },
    prettier,
);
