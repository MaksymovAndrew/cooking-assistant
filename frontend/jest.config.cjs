/** @type {import("jest").Config} */
module.exports = {
    testEnvironment: "jsdom",
    roots: ["<rootDir>/src"],
    testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
    setupFiles: ["<rootDir>/src/test/jest.polyfills.ts"],
    setupFilesAfterEnv: ["<rootDir>/src/test/jest.setup.ts"],
    clearMocks: true,
    restoreMocks: true,
    moduleNameMapper: {
        // env and logger mocks must win for both relative and bare `config/*` imports
        "^(.*/)?config/env$": "<rootDir>/src/test/envMock.ts",
        "^(.*/)?config/logger$": "<rootDir>/src/test/loggerMock.ts",
        // next/navigation and next/link need a real app-router context; these stand in for it
        // and give tests a URL they can read and write (see src/test/nextNavigationMock.ts)
        "^next/navigation$": "<rootDir>/src/test/nextNavigationMock.ts",
        "^next/link$": "<rootDir>/src/test/nextLinkMock.tsx",
        // the request-scoped server APIs, likewise stood in for with real state
        "^next/headers$": "<rootDir>/src/test/nextHeadersMock.ts",
        // the real module throws on import outside a server render - its whole purpose
        "^server-only$": "<rootDir>/src/test/serverOnlyMock.ts",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        "\\.(svg|png|jpg|jpeg|gif|webp|avif|ttf|woff|woff2|eot)$":
            "<rootDir>/src/test/fileMock.ts",
        // bare path aliases - keep in sync with tsconfig.app.json "paths"
        "^api/(.*)$": "<rootDir>/src/api/$1",
        "^app/(.*)$": "<rootDir>/src/app/$1",
        "^assets/(.*)$": "<rootDir>/src/assets/$1",
        "^components/(.*)$": "<rootDir>/src/components/$1",
        "^config/(.*)$": "<rootDir>/src/config/$1",
        "^constants/(.*)$": "<rootDir>/src/constants/$1",
        "^hooks/(.*)$": "<rootDir>/src/hooks/$1",
        "^i18n/(.*)$": "<rootDir>/src/i18n/$1",
        "^redux/(.*)$": "<rootDir>/src/redux/$1",
        "^styles/(.*)$": "<rootDir>/src/styles/$1",
        "^test/(.*)$": "<rootDir>/src/test/$1",
        "^types/(.*)$": "<rootDir>/src/types/$1",
        "^utils/(.*)$": "<rootDir>/src/utils/$1",
    },
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc/jest"],
    },
    transformIgnorePatterns: ["/node_modules/(?!(axios)/)"],
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
        "!src/**/__tests__/**",
        "!src/test/**",
        // routing composition wiring (analogous to backend main/composition-root). Only the
        // wiring is excluded - page.tsx holds real page components now, and they are measured
        "!src/app/**/layout.tsx",
        "!src/app/loading.tsx",
        "!src/app/error.tsx",
        "!src/app/providers.tsx",
        "!src/app/themeInit.ts",
        // redux wiring and typed hook re-exports - composition root, no logic
        "!src/redux/store.ts",
        "!src/redux/hooks.ts",
        "!src/env.d.ts",
        // pure type declarations - no runtime code
        "!src/types/**",
        // globally replaced by mocks in tests (see moduleNameMapper), never executed
        "!src/config/env.ts",
        "!src/config/logger.ts",
        // one-line window.location.assign glue; jsdom locks window.location so it is not
        // unit-testable, and the redirect-on-401/403 behavior is covered in client.test.ts
        "!src/api/redirect.ts",
        // barrel re-export files - no logic
        "!src/**/index.ts",
    ],
    coverageProvider: "v8",
    coverageThreshold: {
        global: {
            branches: 80,
            functions: 80,
            lines: 80,
            statements: 80,
        },
    },
};
