/**
 * Self-tests for scripts/guard-firestore-rules-deploy.mjs.
 *
 * Each case builds a throwaway fixture git repo in the OS temp dir (never the
 * real worktree), mutates it into the target state, runs the guard against it
 * with `--repo <fixture>`, and asserts the exit code. Deterministic; no network.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GUARD = path.resolve(fileURLToPath(import.meta.url), "../../../scripts/guard-firestore-rules-deploy.mjs");
const RULES = "rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{d=**} { allow read, write: if false; }\n  }\n}\n";
const FIREBASE_JSON = JSON.stringify({ firestore: { rules: "firestore.rules", indexes: "firestore.indexes.json" } }, null, 2) + "\n";

function g(dir: string, ...a: string[]) {
  const r = spawnSync("git", ["-C", dir, ...a], { encoding: "utf8" });
  if (r.status !== 0) throw new Error(`git ${a.join(" ")} failed: ${r.stderr || r.stdout}`);
  return (r.stdout || "").trim();
}

const fixtures: string[] = [];
function mkFixture(opts: { firebaseJson?: string } = {}): string {
  const dir = mkdtempSync(path.join(tmpdir(), "guard-fx-"));
  fixtures.push(dir);
  g(dir, "init", "-q");
  g(dir, "config", "user.email", "fixture@example.com");
  g(dir, "config", "user.name", "Fixture");
  g(dir, "config", "commit.gpgsign", "false");
  writeFileSync(path.join(dir, "firestore.rules"), RULES);
  writeFileSync(path.join(dir, "firebase.json"), opts.firebaseJson ?? FIREBASE_JSON);
  writeFileSync(path.join(dir, "README.md"), "# fixture\n");
  g(dir, "add", "-A");
  g(dir, "commit", "-q", "-m", "fixture baseline");
  return dir;
}
function runGuard(dir: string, ...extra: string[]) {
  const r = spawnSync(process.execPath, [GUARD, "--repo", dir, ...extra], { encoding: "utf8" });
  return { code: r.status ?? -1, out: (r.stdout || "") + (r.stderr || "") };
}

let passed = 0;
function check(name: string, fn: () => void) {
  fn();
  passed++;
  console.log(`  PASS: ${name}`);
}

try {
  check("CLEAN_TRACKED_SOURCE -> exit 0", () => {
    const d = mkFixture();
    const r = runGuard(d, "--project", "demo-x");
    assert.equal(r.code, 0, r.out);
    assert.match(r.out, /GUARD_PASS/);
  });

  check("CLEAN + --prod --project bhumiamartya-fe85c -> exit 0", () => {
    const d = mkFixture();
    const r = runGuard(d, "--prod", "--project", "bhumiamartya-fe85c");
    assert.equal(r.code, 0, r.out);
  });

  check("MODIFIED_FIRESTORE_RULES -> exit 1", () => {
    const d = mkFixture();
    writeFileSync(path.join(d, "firestore.rules"), RULES + "// drift\n");
    const r = runGuard(d, "--project", "demo-x");
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /C_CLEAN_WORKTREE.*FAIL|FAIL.*C_CLEAN_WORKTREE|E_RULES_MATCHES_HEAD/s);
  });

  check("STAGED_FIRESTORE_RULES_CHANGE -> exit 1", () => {
    const d = mkFixture();
    writeFileSync(path.join(d, "firestore.rules"), RULES + "// staged drift\n");
    g(d, "add", "firestore.rules");
    const r = runGuard(d, "--project", "demo-x");
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /C2_NO_STAGED/);
  });

  check("OTHER_TRACKED_DIRTY_FILE -> exit 1", () => {
    const d = mkFixture();
    writeFileSync(path.join(d, "README.md"), "# fixture dirtied\n");
    const r = runGuard(d, "--project", "demo-x");
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /C_CLEAN_WORKTREE|C1_NO_UNSTAGED/);
  });

  check("DETACHED_HEAD -> exit 1", () => {
    const d = mkFixture();
    const sha = g(d, "rev-parse", "HEAD");
    g(d, "checkout", "-q", "--detach", sha);
    const r = runGuard(d, "--project", "demo-x");
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /B_NAMED_BRANCH.*FAIL|FAIL.*B_NAMED_BRANCH|DETACHED HEAD/s);
  });

  check("UNTRACKED_FILE -> exit 1 (strict policy: worktree must be pristine)", () => {
    const d = mkFixture();
    mkdirSync(path.join(d, "scratch"));
    writeFileSync(path.join(d, "scratch", "note.txt"), "untracked\n");
    const r = runGuard(d, "--project", "demo-x");
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /C_CLEAN_WORKTREE/);
  });

  check("WRONG_FIREBASE_RULES_PATH -> exit 1", () => {
    const d = mkFixture({ firebaseJson: JSON.stringify({ firestore: { rules: "other.rules" } }, null, 2) + "\n" });
    const r = runGuard(d, "--project", "demo-x");
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /F_FIREBASE_JSON_PATH/);
  });

  check("MISSING_EXPLICIT_PROJECT -> exit 1", () => {
    const d = mkFixture();
    const r = runGuard(d);
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /G_EXPLICIT_PROJECT/);
  });

  check("WRONG_PRODUCTION_PROJECT -> exit 1 when --prod requested", () => {
    const d = mkFixture();
    const r = runGuard(d, "--prod", "--project", "some-other-project");
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /G_EXPLICIT_PROJECT/);
  });

  check("UNTRACKED firestore.rules (not committed) -> exit 1 (D + C)", () => {
    const d = mkdtempSync(path.join(tmpdir(), "guard-fx-"));
    fixtures.push(d);
    g(d, "init", "-q");
    g(d, "config", "user.email", "f@e.com"); g(d, "config", "user.name", "F"); g(d, "config", "commit.gpgsign", "false");
    writeFileSync(path.join(d, "README.md"), "# x\n");
    g(d, "add", "-A"); g(d, "commit", "-q", "-m", "base");
    writeFileSync(path.join(d, "firestore.rules"), RULES);
    writeFileSync(path.join(d, "firebase.json"), FIREBASE_JSON);
    const r = runGuard(d, "--project", "demo-x");
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /D_RULES_TRACKED/);
  });

  console.log(`\nGUARD_FIRESTORE_RULES_DEPLOY_SELFTEST_PASS assertions=${passed}`);
} catch (err) {
  console.error("GUARD_FIRESTORE_RULES_DEPLOY_SELFTEST_FAIL", err instanceof Error ? err.stack || err.message : String(err));
  process.exitCode = 1;
} finally {
  for (const d of fixtures) {
    try { rmSync(d, { recursive: true, force: true }); } catch { /* best effort */ }
  }
}
