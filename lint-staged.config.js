// ESLint v9 flat-config is resolved by cwd, so backend/frontend files need
// eslint run from their own directory; `node -e` + execSync({cwd}) is used
// instead of `cd dir && cmd` because `&&` chaining is unreliable on Windows.
const path = require("path");

const backendDir = path.join(__dirname, "backend");
const frontendDir = path.join(__dirname, "frontend");
const backendFwd = backendDir.replace(/\\/g, "/");
const frontendFwd = frontendDir.replace(/\\/g, "/");
// Windows caps a command line at ~8k characters, so a large commit runs in batches
const BATCH_SIZE = 30;

const inBatches = (items) => {
    const batches = [];

    for (let i = 0; i < items.length; i += BATCH_SIZE) {
        batches.push(items.slice(i, i + BATCH_SIZE).join(" "));
    }

    return batches;
};

const relativeTo = (dir, files) =>
    files.map((f) => path.relative(dir, f).replace(/\\/g, "/").trim());

const prettierCommands = (files) =>
    inBatches(relativeTo(__dirname, files).map((f) => `"${f}"`)).map(
        (batch) => `prettier --write ${batch}`,
    );

const eslintCommands = (dir, dirFwd, files) =>
    inBatches(relativeTo(dir, files)).map(
        (batch) =>
            `node -e "require('child_process').execSync('npx eslint --fix ${batch}',{stdio:'inherit',cwd:'${dirFwd}',shell:true})"`,
    );

module.exports = {
    "backend/**/*.ts": (files) => [
        ...eslintCommands(backendDir, backendFwd, files),
        ...prettierCommands(files),
    ],

    "frontend/**/*.{ts,tsx}": (files) => [
        ...eslintCommands(frontendDir, frontendFwd, files),
        ...prettierCommands(files),
    ],

    "frontend/**/*.{css,scss}": [
        "./frontend/node_modules/.bin/stylelint --fix",
        "prettier --write",
    ],

    "{e2e/**/*.ts,playwright.config.ts}": ["eslint --fix", "prettier --write"],
};
