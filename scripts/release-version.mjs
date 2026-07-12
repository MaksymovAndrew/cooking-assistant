// manages the shared release version (see CLAUDE.md "Versioning")
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
  const match = git("rev-parse", "--abbrev-ref", "HEAD").match(/^release\/(\d+\.\d+)$/);
  return match ? match[1] : null;
}

function changedSides() {
  const committed = git("diff", "--name-only", "main...HEAD").split("\n");
  const workingTree = git("status", "--porcelain")
    .split("\n")
    .map((line) => line.slice(3).split(" -> ").pop());
  const changed = [...committed, ...workingTree].filter(Boolean);
  return SIDES.filter((side) => changed.some((file) => file.startsWith(`${side}/`)));
}

function readPackage(dir) {
  const file = path.join(dir, "package.json");
  return { file, json: JSON.parse(readFileSync(file, "utf8")) };
}

function writeJson(file, json) {
  writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
}

// returns the files it rewrote (empty when the version already matches)
function setVersion(dir, version) {
  const { file, json } = readPackage(dir);
  if (json.version === version) return [];
  json.version = version;
  writeJson(file, json);
  const written = [file];
  const lockFile = path.join(dir, "package-lock.json");
  if (existsSync(lockFile)) {
    const lock = JSON.parse(readFileSync(lockFile, "utf8"));
    lock.version = version;
    if (lock.packages?.[""]) lock.packages[""].version = version;
    writeJson(lockFile, lock);
    written.push(lockFile);
  }
  return written;
}

// a mid-release manual patch (e.g. 3.3.1) must win over the branch default 3.3.0
function targetVersion(branchVersion) {
  const rootVersion = readPackage(".").json.version;
  return rootVersion.startsWith(`${branchVersion}.`) ? rootVersion : `${branchVersion}.0`;
}

function applyVersion(version) {
  return [".", ...changedSides()].flatMap((dir) => setVersion(dir, version));
}

function bump(explicitVersion) {
  let version = explicitVersion;
  if (!version) {
    const branchVersion = releaseBranchVersion();
    if (!branchVersion) {
      fail("not on a release/X.Y branch - pass the version explicitly: npm run bump -- 3.4");
    }
    version = targetVersion(branchVersion);
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
    console.log(`${side}: no changes vs main - keeps ${readPackage(side).json.version}`);
  }
}

function precommit() {
  const branchVersion = releaseBranchVersion();
  if (!branchVersion) return;
  const written = applyVersion(targetVersion(branchVersion));
  if (written.length === 0) return;
  execFileSync("git", ["add", ...written]);
  console.log(`release version auto-bumped and staged: ${written.join(", ")}`);
}

const [, , command, versionArg] = process.argv;
if (command === "bump") bump(versionArg);
else if (command === "precommit") precommit();
else fail("usage: node scripts/release-version.mjs <bump [X.Y] | precommit>");
