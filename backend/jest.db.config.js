const baseConfig = require("./jest.config.js");

// needs Docker (Testcontainers), so it's kept out of `npm test`/pre-commit - run via `npm run test:db`
module.exports = {
    ...baseConfig,
    testMatch: ["**/db-integration/**/*.test.ts"],
    globalSetup: "<rootDir>/src/test/db-integration/globalSetup.ts",
    globalTeardown: "<rootDir>/src/test/db-integration/globalTeardown.ts",
    setupFilesAfterEnv: [],
    collectCoverage: false,
    coverageThreshold: undefined,
};
