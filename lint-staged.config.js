// ESLint finds its config by cwd, so each side lints in its own dir; lint-staged splits the quoted paths
const path = require("path");

// Windows caps a command line at ~8k characters, so a large commit runs in batches
const BATCH_SIZE = 30;

const toPosix = (file) => file.replace(/\\/g, "/");

const inBatches = (files) => {
    const batches = [];

    for (let i = 0; i < files.length; i += BATCH_SIZE) {
        batches.push(
            files
                .slice(i, i + BATCH_SIZE)
                .map((file) => `"${toPosix(file)}"`)
                .join(" "),
        );
    }

    return batches;
};

const rootCommands = (command) => (files) =>
    inBatches(files.map((file) => path.relative(__dirname, file))).map(
        (batch) => `${command} ${batch}`,
    );

const prettierCommands = rootCommands("prettier --write");

// absolute paths, since the tool runs inside its package directory
const toolCommands = (dir, tool, files) =>
    inBatches(files.map((file) => path.resolve(file))).map(
        (batch) => `node scripts/run-tool.mjs ${dir} ${tool} --fix ${batch}`,
    );

module.exports = {
    "backend/**/*.ts": (files) => [
        ...toolCommands("backend", "eslint", files),
        ...prettierCommands(files),
    ],

    "frontend/**/*.{ts,tsx}": (files) => [
        ...toolCommands("frontend", "eslint", files),
        ...prettierCommands(files),
    ],

    "frontend/**/*.{css,scss}": (files) => [
        ...toolCommands("frontend", "stylelint", files),
        ...prettierCommands(files),
    ],

    "{e2e/**/*.ts,playwright.config.ts}": ["eslint --fix", "prettier --write"],
};
