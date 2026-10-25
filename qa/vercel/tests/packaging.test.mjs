import assert from "node:assert/strict";
import {
  existsSync,
  lstatSync,
  readFileSync,
  readdirSync,
  realpathSync,
} from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "..");
const repoRoot = path.resolve(root, "../..");
const packageJson = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));

function walk(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return walk(fullPath);
    return entry.isFile() && entry.name.endsWith(".mjs") ? [fullPath] : [];
  });
}

function packageName(specifier) {
  return specifier.startsWith("@")
    ? specifier.split("/").slice(0, 2).join("/")
    : specifier.split("/")[0];
}

test("Vercel candidate is self-contained and packages the verified QA backend", () => {
  const sourceFiles = ["api", "lib"].flatMap((directory) => walk(path.join(root, directory)));
  assert.ok(sourceFiles.length > 0);

  for (const file of sourceFiles) {
    const source = readFileSync(file, "utf8");
    const imports = [...source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)].map((match) => match[1]);
    for (const specifier of imports) {
      if (specifier.startsWith("node:")) continue;
      if (specifier.startsWith(".")) {
        const resolved = path.resolve(path.dirname(file), specifier);
        assert.ok(
          resolved === root || resolved.startsWith(`${root}${path.sep}`),
          `${path.relative(root, file)} escapes the Vercel root via ${specifier}`,
        );
        assert.ok(existsSync(resolved), `${path.relative(root, file)} imports missing ${specifier}`);
        continue;
      }
      assert.ok(
        Object.hasOwn(packageJson.dependencies || {}, packageName(specifier)),
        `${path.relative(root, file)} imports undeclared package ${specifier}`,
      );
    }
  }

  assert.equal(packageJson.dependencies["@bhumi/qa-backend"], "file:../backend");
  assert.match(readFileSync(path.join(root, ".npmrc"), "utf8"), /^install-links=true$/m);
  assert.ok(existsSync(path.join(root, "package-lock.json")));

  const backendPackage = JSON.parse(readFileSync(path.join(repoRoot, "qa/backend/package.json"), "utf8"));
  assert.equal(backendPackage.exports["./server"], "./lib/server.mjs");
  assert.deepEqual(backendPackage.files, ["lib/"]);

  for (const dependency of Object.keys(packageJson.dependencies)) {
    if (dependency === "@bhumi/qa-backend") continue;
    assert.ok(
      existsSync(path.join(root, "node_modules", dependency, "package.json")),
      `missing installed dependency ${dependency}; run npm install in qa/vercel`,
    );
  }

  const installedRoot = path.join(root, "node_modules", "@bhumi", "qa-backend");
  assert.ok(existsSync(path.join(installedRoot, "package.json")), "run npm install in qa/vercel");
  assert.equal(lstatSync(installedRoot).isSymbolicLink(), false);
  assert.ok(realpathSync(installedRoot).startsWith(`${root}${path.sep}`));

  for (const file of ["server.mjs", "first-login.mjs", "bootstrap-contract.mjs", "token-verifier.mjs"]) {
    assert.equal(
      readFileSync(path.join(installedRoot, "lib", file), "utf8"),
      readFileSync(path.join(repoRoot, "qa", "backend", "lib", file), "utf8"),
      `installed ${file} is stale; rerun npm install in qa/vercel`,
    );
  }

  const vercelConfig = JSON.parse(readFileSync(path.join(root, "vercel.json"), "utf8"));
  assert.equal(vercelConfig.framework, null);
  assert.ok(Object.hasOwn(vercelConfig.functions, "api/**/*.mjs"));
  assert.equal(walk(path.join(root, "api")).some((file) => /billing/i.test(file)), false);
});
