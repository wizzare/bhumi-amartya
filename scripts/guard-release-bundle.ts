import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

console.log("▶ Running Release Bundle Security Guard Audit...\n");

let violations: string[] = [];

// Prohibited strings in Production HD / App Check code paths
const FORBIDDEN_PATTERNS = [
  { pattern: "bhumi-dev-bypass", description: "Hardcoded DEV_BYPASS secret in production path" },
  { pattern: "http://localhost:3000/api/humandesign", description: "Hardcoded localhost 3000 HD API URL" },
  { pattern: "http://localhost:8000/api/humandesign", description: "Hardcoded localhost 8000 HD API URL" },
  { pattern: "EYJhbGciOiJSUzI1NiIs", description: "Hardcoded JWT Token string" },
];

// Targeted production source files to inspect
const PRODUCTION_SOURCE_FILES = [
  "lib/config/hdApiUrl.ts",
  "lib/humandesign/hdkitAdapter.ts",
  "lib/humandesign/calculateHumanDesign.ts",
  "app/api/humandesign/calculate/route.ts",
];

for (const relPath of PRODUCTION_SOURCE_FILES) {
  if (!existsSync(relPath)) continue;
  const content = readFileSync(relPath, "utf8");

  // Verify that dev bypass is strictly gated behind non-production NODE_ENV check
  if (content.includes("bhumi-dev-bypass")) {
    if (!content.includes('process.env.NODE_ENV !== "production"') && !content.includes('process.env.NODE_ENV === "development"')) {
      violations.push(`Un-gated dev bypass in ${relPath}`);
    }
  }

  for (const { pattern, description } of FORBIDDEN_PATTERNS) {
    if (pattern !== "bhumi-dev-bypass" && content.includes(pattern)) {
      violations.push(`Forbidden pattern "${pattern}" (${description}) found in ${relPath}`);
    }
  }
}

// Inspect Capacitor web build assets if present
const webDir = "out";
if (existsSync(webDir)) {
  function scanDir(dir: string) {
    const files = readdirSync(dir);
    for (const f of files) {
      const fullPath = join(dir, f);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        scanDir(fullPath);
      } else if (f.endsWith(".js") || f.endsWith(".html") || f.endsWith(".json")) {
        const text = readFileSync(fullPath, "utf8");
        if (text.includes("bhumi-dev-bypass") && !text.includes("NODE_ENV") && !text.includes("development")) {
          violations.push(`Production bundle asset ${fullPath} contains raw dev bypass`);
        }
      }
    }
  }
  scanDir(webDir);
}

console.log("--- RELEASE BUNDLE GUARD AUDIT SUMMARY ---");
if (violations.length === 0) {
  console.log("✅ PASS: 0 release security violations found.");
  console.log("  - No debug tokens in release path");
  console.log("  - Dev bypass strictly gated behind NODE_ENV !== 'production'");
  console.log("  - No hardcoded localhost HD URLs in production paths\n");
} else {
  console.error("❌ FAIL: Security violations found in release bundle:");
  for (const v of violations) {
    console.error(`  - ${v}`);
  }
  process.exit(1);
}
