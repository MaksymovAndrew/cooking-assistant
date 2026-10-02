// sets a repo-local `git skip-checks` alias (in .git/config, NOT global) so that
// `git skip-checks commit -m "..."` / `git skip-checks push ...` run with
// SKIP_CHECKS=1 - skipping the local hooks and stamping [skip-checks] into the
// commit subject. wired into the root `prepare` script, so it is installed on
// every npm install. cross-shell: git runs the alias body through its own bundled
// sh, independent of the caller's shell. failures (e.g. outside a git checkout)
// are ignored so they never break install.
import { spawnSync } from "node:child_process";

const SKIP_ALIAS = '!f() { SKIP_CHECKS=1 git "$@"; }; f';

spawnSync("git", ["config", "--local", "alias.skip-checks", SKIP_ALIAS], {
    stdio: "ignore",
});
