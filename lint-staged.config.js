// ESLint v9 flat-config is resolved by cwd, so backend/frontend files need
// eslint run from their own directory; `node -e` + execSync({cwd}) is used
// instead of `cd dir && cmd` because `&&` chaining is unreliable on Windows.
const path = require("path");

const backendDir = path.join(__dirname, "backend");
const frontendDir = path.join(__dirname, "frontend");
const backendFwd = backendDir.replace(/\\/g, "/");
const frontendFwd = frontendDir.replace(/\\/g, "/");

module.exports = {
    "backend/**/*.ts": (files) => {
        const relPaths = files
            .map((f) => path.relative(backendDir, f).replace(/\\/g, "/").trim())
            .join(" ");
        const absPaths = files.map((f) => `"${f.replace(/\\/g, "/")}"`).join(" ");

        return [
            `node -e "require('child_process').execSync('npx eslint --fix ${relPaths}',{stdio:'inherit',cwd:'${backendFwd}',shell:true})"`,
            `prettier --write ${absPaths}`,
        ];
    },

    "frontend/**/*.{ts,tsx}": (files) => {
        const relPaths = files
            .map((f) => path.relative(frontendDir, f).replace(/\\/g, "/").trim())
            .join(" ");
        const absPaths = files.map((f) => `"${f.replace(/\\/g, "/")}"`).join(" ");

        return [
            `node -e "require('child_process').execSync('npx eslint --fix ${relPaths}',{stdio:'inherit',cwd:'${frontendFwd}',shell:true})"`,
            `prettier --write ${absPaths}`,
        ];
    },

    "frontend/**/*.{css,scss}": [
        "./frontend/node_modules/.bin/stylelint --fix",
        "prettier --write",
    ],

    "{e2e/**/*.ts,playwright.config.ts}": ["eslint --fix", "prettier --write"],
};
