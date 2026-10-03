import { spawnSync } from "node:child_process";

// git runs a "!" alias through its own sh, so the caller's shell doesn't matter
const SKIP_ALIAS = '!f() { SKIP_CHECKS=1 git "$@"; }; f';

// output and failures (e.g. outside a git checkout) are ignored so they never break install
spawnSync("git", ["config", "--local", "alias.skip-checks", SKIP_ALIAS], {
    stdio: "ignore",
});
