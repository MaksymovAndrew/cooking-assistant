// no shell, so [locale] and (public) paths arrive verbatim; ESLint resolves its config from the cwd
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const [dir, tool, ...args] = process.argv.slice(2);
const cwd = path.resolve(dir);
const manifestPath = createRequire(path.join(cwd, "package.json")).resolve(
    `${tool}/package.json`,
);
const { bin } = JSON.parse(readFileSync(manifestPath, "utf8"));
const entry = typeof bin === "string" ? bin : bin[tool];
const result = spawnSync(
    process.execPath,
    [path.join(path.dirname(manifestPath), entry), ...args],
    { cwd, stdio: "inherit" },
);

process.exit(result.status ?? 1);
