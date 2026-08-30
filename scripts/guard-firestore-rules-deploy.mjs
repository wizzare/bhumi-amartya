#!/usr/bin/env node
/**
 * Firestore Rules deployment provenance guard (preflight only — NEVER deploys).
 *
 * Production Firestore Rules previously drifted from Git because rules were
 * deployed from dirty / uncommitted / agent-host-checkpoint source. This guard
 * hard-fails unless the deployment worktree is a pristine, committed, named
 * branch whose on-disk `firestore.rules` is exactly the committed source, and a
 * project is explicitly named (no implicit Firebase alias). It performs no
 * network calls and no writes unless `--check-production-drift` is passed, and
 * that mode is read-only and never affects the pass/fail verdict unless
 * `--require-drift-match` is also passed.
 *
 * Usage:
 *   node scripts/guard-firestore-rules-deploy.mjs --project <id> [--prod]
 *        [--repo <path>] [--rules-file <name>] [--check-production-drift]
 *        [--require-drift-match]
 *
 * Exit 0 = all mandatory checks pass. Exit 1 = any mandatory check fails.
 *
 * Wire it before a deploy, e.g.:
 *   npm run deploy:firestore-rules:prod
 *   -> node scripts/guard-firestore-rules-deploy.mjs --prod --project bhumiamartya-fe85c
 *      && firebase deploy --only firestore:rules --project bhumiamartya-fe85c
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const PROD_PROJECT_ID = "bhumiamartya-fe85c";

function parseArgs(argv) {
  const a = { flags: new Set(), opts: {} };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--prod" || t === "--production") a.flags.add("prod");
    else if (t === "--check-production-drift") a.flags.add("drift");
    else if (t === "--require-drift-match") a.flags.add("requireDrift");
    else if (t === "--project") a.opts.project = argv[++i];
    else if (t === "--repo") a.opts.repo = argv[++i];
    else if (t === "--rules-file") a.opts.rulesFile = argv[++i];
    else if (t.startsWith("--project=")) a.opts.project = t.slice("--project=".length);
    else if (t.startsWith("--repo=")) a.opts.repo = t.slice("--repo=".length);
  }
  return a;
}

const args = parseArgs(process.argv.slice(2));
const REPO = path.resolve(args.opts.repo || process.cwd());
const RULES_FILE = args.opts.rulesFile || "firestore.rules";
const IS_PROD = args.flags.has("prod");

function git(gitArgs, { allowFail = false } = {}) {
  const r = spawnSync("git", ["-C", REPO, ...gitArgs], { encoding: "utf8" });
  if (r.status !== 0 && !allowFail) {
    return { ok: false, code: r.status ?? -1, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
  }
  return { ok: r.status === 0, code: r.status ?? -1, out: (r.stdout || "").trim(), err: (r.stderr || "").trim() };
}

const lf = (s) => s.replace(/\r\n/g, "\n");
const sha256 = (s) => createHash("sha256").update(s, "utf8").digest("hex");

const results = [];
const record = (id, pass, detail) => {
  results.push({ id, pass, detail });
  console.log(`  ${pass ? "PASS" : "FAIL"}  ${id}${detail ? "  — " + detail : ""}`);
};

console.log(`Firestore Rules deploy guard  (repo=${REPO}  rulesFile=${RULES_FILE}  prod=${IS_PROD})`);

// A. git repository + HEAD
const head = git(["rev-parse", "HEAD"], { allowFail: true });
record("A_GIT_HEAD", head.ok && /^[0-9a-f]{40}$/.test(head.out), head.ok ? `HEAD ${head.out.slice(0, 10)}` : "not a git repo / no commits");

// B. on a named branch (not detached)
const branch = git(["symbolic-ref", "--short", "-q", "HEAD"], { allowFail: true });
record("B_NAMED_BRANCH", branch.ok && branch.out.length > 0, branch.ok ? `branch ${branch.out}` : "DETACHED HEAD");

// C. pristine tracked+untracked working tree (strict: `git status --porcelain` empty)
const status = git(["status", "--porcelain"], { allowFail: true });
const dirtyLines = status.ok ? status.out.split("\n").filter(Boolean) : ["<git status failed>"];
record("C_CLEAN_WORKTREE", status.ok && dirtyLines.length === 0,
  dirtyLines.length === 0 ? "no tracked/staged/untracked changes" : `${dirtyLines.length} entry(ies): ${dirtyLines.slice(0, 5).join(" | ")}`);
// belt-and-braces explicit tracked checks
const diffUnstaged = git(["diff", "--quiet"], { allowFail: true });
const diffStaged = git(["diff", "--cached", "--quiet"], { allowFail: true });
record("C1_NO_UNSTAGED", diffUnstaged.code === 0, diffUnstaged.code === 0 ? "" : "unstaged tracked changes present");
record("C2_NO_STAGED", diffStaged.code === 0, diffStaged.code === 0 ? "" : "staged changes present");

// D. firestore.rules is tracked
const tracked = git(["ls-files", "--error-unmatch", RULES_FILE], { allowFail: true });
record("D_RULES_TRACKED", tracked.ok, tracked.ok ? `${RULES_FILE} is tracked` : `${RULES_FILE} is NOT tracked by git`);

// E. on-disk rules === committed rules (git-diff identity, autocrlf-aware; plus LF-normalized sha256 for the log)
const rulesDiff = git(["diff", "--quiet", "HEAD", "--", RULES_FILE], { allowFail: true });
const rulesDiffCached = git(["diff", "--cached", "--quiet", "--", RULES_FILE], { allowFail: true });
let onDiskSha = "n/a", headSha = "n/a", shaMatch = false;
try {
  const onDisk = lf(readFileSync(path.join(REPO, RULES_FILE), "utf8"));
  const showHead = git(["show", `HEAD:${RULES_FILE}`], { allowFail: true });
  if (showHead.ok) {
    onDiskSha = sha256(onDisk);
    headSha = sha256(lf(showHead.out.endsWith("\n") ? showHead.out : showHead.out + "\n"));
    // `git show` strips a single trailing newline inconsistently; compare both ways
    shaMatch = onDiskSha === headSha || sha256(onDisk.replace(/\n$/, "")) === sha256(lf(showHead.out).replace(/\n$/, ""));
  }
} catch { /* handled by rulesDiff below */ }
record("E_RULES_MATCHES_HEAD", rulesDiff.code === 0 && rulesDiffCached.code === 0,
  rulesDiff.code === 0 && rulesDiffCached.code === 0
    ? `on-disk ${RULES_FILE} == HEAD (LF sha256 ${onDiskSha.slice(0, 16)}…)`
    : `on-disk ${RULES_FILE} differs from committed HEAD`);

// F. firebase.json points firestore.rules -> exactly RULES_FILE
let fbOk = false, fbDetail = "firebase.json not found";
const fbPath = path.join(REPO, "firebase.json");
if (existsSync(fbPath)) {
  try {
    const fb = JSON.parse(readFileSync(fbPath, "utf8"));
    const configured = fb?.firestore?.rules;
    fbOk = configured === RULES_FILE;
    fbDetail = `firebase.json firestore.rules = ${JSON.stringify(configured)} (expected ${JSON.stringify(RULES_FILE)})`;
  } catch (e) {
    fbDetail = `firebase.json parse error: ${e.message}`;
  }
}
record("F_FIREBASE_JSON_PATH", fbOk, fbDetail);

// G. explicit project (no implicit alias); prod mode must name the prod project exactly
const project = args.opts.project;
if (!project) {
  record("G_EXPLICIT_PROJECT", false, "--project <id> is required (no implicit Firebase alias allowed)");
} else if (IS_PROD && project !== PROD_PROJECT_ID) {
  record("G_EXPLICIT_PROJECT", false, `--prod requires --project ${PROD_PROJECT_ID}; got ${project}`);
} else {
  record("G_EXPLICIT_PROJECT", true, `--project ${project}${IS_PROD ? " (production)" : ""}`);
}

// Optional §7: read-only Production Rules drift check (no credentials in source).
if (args.flags.has("drift")) {
  const tok = spawnSync("gcloud", ["auth", "print-access-token"], { encoding: "utf8" });
  if (tok.status !== 0 || !tok.stdout.trim()) {
    record("DRIFT_CHECK", !args.flags.has("requireDrift"), "SKIPPED — no gcloud access token available (operational-only check)");
  } else {
    const proj = IS_PROD ? PROD_PROJECT_ID : (project || PROD_PROJECT_ID);
    const curl = spawnSync("curl", ["-s", "-H", `Authorization: Bearer ${tok.stdout.trim()}`, "-H", `x-goog-user-project: ${proj}`,
      `https://firebaserules.googleapis.com/v1/projects/${proj}/releases/cloud.firestore`], { encoding: "utf8" });
    let deployedLfSha = null;
    try {
      const rel = JSON.parse(curl.stdout);
      const rid = rel.rulesetName.split("/").pop();
      const rs = spawnSync("curl", ["-s", "-H", `Authorization: Bearer ${tok.stdout.trim()}`, "-H", `x-goog-user-project: ${proj}`,
        `https://firebaserules.googleapis.com/v1/projects/${proj}/rulesets/${rid}`], { encoding: "utf8" });
      const j = JSON.parse(rs.stdout);
      const file = j.source.files.find((x) => x.name === RULES_FILE) || j.source.files[0];
      deployedLfSha = sha256(lf(file.content));
    } catch { /* leave null */ }
    const onDisk = (() => { try { return sha256(lf(readFileSync(path.join(REPO, RULES_FILE), "utf8"))); } catch { return null; } })();
    const match = deployedLfSha && onDisk && deployedLfSha === onDisk;
    record("DRIFT_CHECK", !args.flags.has("requireDrift") || match,
      deployedLfSha ? `deployed LF sha256 ${String(deployedLfSha).slice(0, 16)}…  vs on-disk ${String(onDisk).slice(0, 16)}…  -> ${match ? "MATCH" : "DRIFT"}` : "unable to read deployed rules");
  }
}

const failed = results.filter((r) => !r.pass);
console.log("");
if (failed.length) {
  console.log(`GUARD_FAIL  ${failed.length} check(s) failed: ${failed.map((r) => r.id).join(", ")}`);
  console.log("Refusing Firestore Rules deployment. Start from a clean, committed, named branch and name the project explicitly.");
  process.exit(1);
}
console.log(`GUARD_PASS  all ${results.length} checks passed — safe to deploy Firestore Rules to project '${project}'.`);
process.exit(0);
