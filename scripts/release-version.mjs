// manages the shared release version (see AGENTS.md "Versioning")
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const SIDES = ["backend", "frontend"];

function git(...args) {
    return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function fail(message) {
    console.error(message);
    process.exit(1);
}

function releaseBranchVersion() {
    const branch = git("rev-parse", "--abbrev-ref", "HEAD");
    const release = branch.match(/^release\/(\d+\.\d+)$/);
    if (release) return { kind: "release", value: release[1] };
    const hotfix = branch.match(/^hotfix\/(\d+\.\d+\.\d+)$/);
    if (hotfix) return { kind: "hotfix", value: hotfix[1] };
    return null;
}

function changedSides() {
    const committed = git("diff", "--name-only", "main...HEAD").split("\n");
    const workingTree = git("status", "--porcelain")
        .split("\n")
        .map((line) => line.slice(3).split(" -> ").pop());
    const changed = [...committed, ...workingTree].filter(Boolean);
    return SIDES.filter((side) =>
        changed.some((file) => file.startsWith(`${side}/`)),
    );
}

// keeps each file's own indent - re-indenting turns a version bump into a whole-file diff
function readJson(file) {
    const text = readFileSync(file, "utf8");
    const indent = text.match(/^[ \t]+(?=")/m)?.[0] ?? "  ";
    return { json: JSON.parse(text), indent };
}

function writeJson(file, json, indent) {
    writeFileSync(file, `${JSON.stringify(json, null, indent)}\n`);
}

function readPackage(dir) {
    const file = path.join(dir, "package.json");
    return { file, ...readJson(file) };
}

function setVersion(dir, version) {
    const { file, json, indent } = readPackage(dir);
    if (json.version === version) return [];
    json.version = version;
    writeJson(file, json, indent);
    const written = [file];
    const lockFile = path.join(dir, "package-lock.json");
    if (existsSync(lockFile)) {
        const lock = readJson(lockFile);
        lock.json.version = version;
        if (lock.json.packages?.[""]) lock.json.packages[""].version = version;
        writeJson(lockFile, lock.json, lock.indent);
        written.push(lockFile);
    }
    return written;
}

// a manual mid-release patch (e.g. 3.3.1) wins over the branch default 3.3.0
function targetVersion(branchInfo) {
    if (branchInfo.kind === "hotfix") return branchInfo.value;
    const rootVersion = readPackage(".").json.version;
    return rootVersion.startsWith(`${branchInfo.value}.`)
        ? rootVersion
        : `${branchInfo.value}.0`;
}

function applyVersion(version) {
    return [".", ...changedSides()].flatMap((dir) => setVersion(dir, version));
}

function bump(explicitVersion) {
    let version = explicitVersion;
    if (!version) {
        const branchInfo = releaseBranchVersion();
        if (!branchInfo) {
            fail(
                "not on a release/X.Y or hotfix/X.Y.Z branch - pass the version explicitly: npm run bump -- 3.4",
            );
        }
        version = targetVersion(branchInfo);
    }
    if (/^\d+\.\d+$/.test(version)) version = `${version}.0`;
    if (!/^\d+\.\d+\.\d+$/.test(version)) {
        fail(`"${version}" is not an X.Y or X.Y.Z version`);
    }
    const written = applyVersion(version);
    console.log(
        written.length > 0
            ? `set ${version} in: ${written.join(", ")}`
            : `everything already at ${version}`,
    );
    for (const side of SIDES.filter((s) => !changedSides().includes(s))) {
        console.log(
            `${side}: no changes vs main - keeps ${readPackage(side).json.version}`,
        );
    }
}

function precommit() {
    const branchInfo = releaseBranchVersion();
    if (!branchInfo) return;
    const written = applyVersion(targetVersion(branchInfo));
    if (written.length === 0) return;
    execFileSync("git", ["add", ...written]);
    console.log(
        `release version auto-bumped and staged: ${written.join(", ")}`,
    );
}

const [, , command, versionArg] = process.argv;
if (command === "bump") bump(versionArg);
else if (command === "precommit") precommit();
else fail("usage: node scripts/release-version.mjs <bump [X.Y] | precommit>");
