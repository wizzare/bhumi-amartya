/**
 * Static guard: the root Next.js application must not import from the standalone
 * `services/` subproject (it has its own package.json / lockfile / tsconfig /
 * Node engine and is excluded from the root tsconfig). This prevents a future
 * accidental dependency on code the root build no longer typechecks.
 *
 * No network. Hard-fail: sets process.exitCode = 1 on any violation.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const REPO_ROOT = path.resolve(__dirname, "..", "..");
const SCAN_DIRS = ["app", "components", "context", "lib", "src"];
const CODE_EXT = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".jsx", ".mjs"]);
const SERVICES_DIR = path.join(REPO_ROOT, "services") + path.sep;

// import ... from "X" | export ... from "X" | require("X") | import("X")
const SPEC_RE = /(?:import|export)[\s\S]*?from\s*['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function walk(dir: string, acc: string[]): string[] {
  let entries: string[];
  try { entries = readdirSync(dir); } catch { return acc; }
  for (const name of entries) {
    const full = path.join(dir, name);
    let s;
    try { s = statSync(full); } catch { continue; }
    if (s.isDirectory()) {
      if (name === "node_modules" || name === ".next") continue;
      walk(full, acc);
    } else if (CODE_EXT.has(path.extname(name))) {
      acc.push(full);
    }
  }
  return acc;
}

function resolveSpec(fromFile: string, spec: string): string | null {
  if (spec.startsWith("@/")) return path.resolve(REPO_ROOT, spec.slice(2));
  if (spec.startsWith("./") || spec.startsWith("../")) return path.resolve(path.dirname(fromFile), spec);
  return null; // bare specifier -> node_modules, not our concern
}

const files: string[] = [];
for (const d of SCAN_DIRS) walk(path.join(REPO_ROOT, d), files);

const violations: string[] = [];
for (const file of files) {
  const src = readFileSync(file, "utf8");
  for (const m of src.matchAll(SPEC_RE)) {
    const spec = m[1] || m[2] || m[3];
    if (!spec) continue;
    const resolved = resolveSpec(file, spec);
    if (resolved && (resolved + path.sep).startsWith(SERVICES_DIR)) {
      violations.push(`${path.relative(REPO_ROOT, file)}  ->  ${spec}`);
    }
  }
}

console.log(`ROOT_IMPORT_BOUNDARY scannedFiles=${files.length} scannedDirs=${SCAN_DIRS.join(",")}`);
if (violations.length > 0) {
  console.error("ROOT_IMPORT_BOUNDARY_FAIL: root app imports from excluded services/ subproject:");
  for (const v of violations) console.error("  " + v);
  process.exitCode = 1;
} else {
  try {
    assert.equal(violations.length, 0);
    console.log("ROOT_IMPORT_BOUNDARY_PASS violations=0");
  } catch (err) {
    console.error("ROOT_IMPORT_BOUNDARY_FAIL", err instanceof Error ? err.message : String(err));
    process.exitCode = 1;
  }
}
